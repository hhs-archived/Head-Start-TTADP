// @ts-check

import { Client } from "@elastic/elasticsearch";
import { logger, auditLogger } from "../../logger";
import { Queue } from "bull";
import { Model } from "sequelize";
import db from "../../models";
import { createElasticsearchQueue } from "./queue";
import { modelNameToIndexName } from ".";

/**
 * @typedef {Object} InitElasticsearchWorkerOptions
 * @param {Client|undefined} client A pre-configured Elasticsearch client.
 * @param {NodeJS.ProcessEnv|Dict<string>|undefined} env Environment variables (process.env used if not provided).
 * @param {Queue|undefined} queue Bull queue to use
 */

/**
 * @typedef {Object} InitElasticsearchWorkerResult
 * @param {Function} indexModel
 * @param {Function} processIndexModelJob
 * @param {Function} processRemoveModelJob
 * @param {Function} scheduleIndexModelJob
 * @param {Function} scheduleRemoveModelJob
 * @param {Function} startElasticsearchWorker
 */

/**
 * Initializes the worker side of Elasticsearch integration. Returns a series
 * of functions that can be used to schedule and run worker processing.
 * @param {InitElasticsearchWorkerOptions} options
 * @returns {InitElasticsearchWorkerResult}
 */
export function initElasticsearchWorker({ client, env, models, queue } = {}) {
  env = env || process.env;

  models = models || db;

  queue = queue || createElasticsearchQueue();

  return {
    indexModel,
    processIndexModelJob,
    processRemoveModelJob,
    removeModel,
    scheduleIndexModelJob,
    scheduleRemoveModelJob,
    startElasticsearchWorker,
  };

  async function indexModel(instance) {
    return await client.index({
      index: modelNameToIndexName(instance.constructor.name),
      id: String(instance.id),
      body: instance.toJSON(),
      refresh: true,
    });
  }

  /**
   * Adds a job to the queue that will add the given Model instance to
   * the Elasticsearch index.
   * @param {{id: any}} instance Model instance to be scheduled for indexing.
   * @return {void}
   */
  function scheduleIndexModelJob(instance) {
    queue.add("indexModel", {
      type: instance.constructor.name,
      id: instance.id,
    });
  }

  /**
   * Adds a job to the queue that will remove the given Model instance from
   * the Elasticsearch index.
   * @param {{id: any}} instance
   */
  function scheduleRemoveModelJob(instance) {
    queue.add("removeModel", {
      type: instance.constructor.name,
      id: instance.id,
    });
  }

  /**
   * Worker job processor that handles loading a model instance from the
   * Postgres database and adding it to the Elasticsearch index.
   * @param {{name: "index", data: { id: any, type: string }}} job
   * @returns {Promise<void>}
   */
  async function processIndexModelJob(job) {
    const { type, id } = job.data;

    logger.info(`processIndexModelJob ${type} ${id}`);

    const modelType = models[type];
    if (!modelType) {
      throw new Error(`Model ${type} was not found`);
    }

    const instance = await modelType.findByPk(id);
    if (!instance) {
      // TODO: Throwing here may not make sense, as it will trigger a retry of the indexing job, which will also fail...
      throw new Error(`${type} #${id} was not found in the database.`);
    }

    return await indexModel(instance);
  }

  async function processRemoveModelJob(job) {
    const { type, id } = job.data;

    const modelType = models[type];
    if (!modelType) {
      throw new Error(`Model ${type} was not found`);
    }

    // TODO: Likely don't actually need to query for instance here -- we should just remove them
    const instance = await modelType.findByPk(id);
    if (!instance) {
      // TODO: Throwing here may not make sense, as it will trigger a retry of the indexing job, which will also fail...
      throw new Error(`${type} #${id} was not found in the database.`);
    }

    return await removeModel(instance);
  }

  /**
   * Removes a model from the Elasticsearch index
   * @param {{id: any}} instance 
   * @returns {Promise<Object>}
   */
  async function removeModel(instance) {
    return await client.delete({
      index: modelNameToIndexName(instance.constructor.name),
      id: String(instance.id),
      refresh: true,
    });
  }

  /**
   * Starts processing things on the search indexing queue.
   */
  function startElasticsearchWorker() {
    queue.process("indexModel", processIndexModelJob);
    queue.process("removeModel", processRemoveModelJob);
  }
}
