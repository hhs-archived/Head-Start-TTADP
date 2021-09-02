// @ts-check

import { Client } from "@elastic/elasticsearch";
import { createElasticsearchQueue } from "./queue";
import { downloadFile as reallyDownloadFile } from "../s3";
import { logger } from "../../logger";
import { MAPPINGS } from "./mappings";
import { Model } from "sequelize";
import { modelNameToIndexName } from "./utils";
import { PIPELINES } from "./pipelines";
import { Queue } from "bull";
import db from "../../models";

/**
 * @typedef {Object} InitElasticsearchWorkerOptions
 * @param {((key: string) => Promise<{Body: Buffer}>) | undefined} downloadFile Function used to download files by key from object storage
 * @param {Client|undefined} client A pre-configured Elasticsearch client.
 * @param {Dict<string,Model>|undefined} models Set of available Sequelize models
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
export function initElasticsearchWorker({
  configureMappings,
  configurePipelines,
  client,
  downloadFile = reallyDownloadFile,
  models = db,
  queue,
} = {}) {
  queue = queue || createElasticsearchQueue();

  return {
    indexModel,
    processIndexFileJob,
    processIndexModelJob,
    processRemoveFileJob,
    processRemoveModelJob,
    removeModel,
    scheduleIndexFileJob,
    scheduleIndexModelJob,
    scheduleRemoveFileJob,
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

  /**
   * Processes a job meant to remove a record from Elasticsearch.
   * @param {{name: "remove", data: {id: any, type: string}}} job
   * @returns
   */
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
   * Schedules an indexing job to run for the given file.
   * @param {{id: number}} file
   */
  function scheduleIndexFileJob(file) {
    queue.add("indexFile", {
      id: file.id,
    });
  }

  /**
   * Schedules a job to remove the given File from the index.
   * @param {{id: number}} file
   */
  function scheduleRemoveFileJob(file) {
    queue.add("removeFile", {
      id: file.id,
    });
  }

  /**
   * @param {{name: "indexFile", data: {id: number}}} job
   * @returns {Promise<Boolean>} Whether or not the file was actually indexed.
   */
  async function processIndexFileJob(job) {
    const {
      data: { id },
    } = job;

    const { File } = models;

    /**
     * @type {{activityReportId: string, id: number, key: string}}
     */
    const file = await File.findByPk(id);

    if (!file) {
      throw new Error(`File not found: ${id}`);
    }

    /**
     * @type {{Body: Buffer}}
     */
    const s3Object = await downloadFile(file.key);

    await client.index({
      index: modelNameToIndexName("File"),
      id: String(file.id),
      body: {
        activityReportId: String(file.activityReportId),
        data: s3Object.Body.toString("base64"),
      },
      pipeline: "attachment",
      refresh: true,
    });

    return true;
  }

  async function processRemoveFileJob(job) {
    const {
      data: { id },
    } = job;

    await client.delete({
      index: modelNameToIndexName("File"),
      id: String(id),
      refresh: true,
    });
  }

  /**
   * Starts processing things on the search indexing queue.
   */
  async function startElasticsearchWorker() {
    queue.process("indexModel", processIndexModelJob);
    queue.process("removeModel", processRemoveModelJob);
    queue.process("indexFile", processIndexFileJob);
    queue.process("removeFile", processRemoveFileJob);

    await Promise.all(
      [
        configureMappings && doMappingConfig(),
        configurePipelines && doPipelineConfig(),
      ].filter((x) => x)
    );

    function doMappingConfig() {
      // See mappings.js for the actual mapping configuration
      return Object.keys(MAPPINGS).reduce(
        (p, modelName) =>
          p.then(async () => {
            const mapping = MAPPINGS[modelName];
            if (!mapping) {
              return;
            }
            await client.indices.putMapping({
              index: modelNameToIndexName(modelName),
              body: mapping,
            });
          }),

        Promise.resolve()
      );
    }

    function doPipelineConfig() {
      // Configure the attachment pipeline for processing uploaded documents
      return Object.keys(PIPELINES).reduce(
        (p, id) =>
          p.then(async () => {
            const pipeline = PIPELINES[id];
            if (!pipeline) {
              return;
            }
            await client.ingest.putPipeline({
              id,
              body: pipeline,
            });
          }),
        Promise.resolve()
      );
    }
  }
}
