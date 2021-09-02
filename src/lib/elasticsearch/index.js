// @ts-check

import { snakeCase } from "lodash";
import Sequelize, { Model, Transaction } from "sequelize";
import { createAWSConnection } from "@acuris/aws-es-connection";
import { Client, ClientOptions } from "@elastic/elasticsearch";
import { Queue } from "bull";
import db from "../../models";
import { logger, auditLogger } from "../../logger";

import { createElasticsearchQueue } from "./queue";
import { createElasticsearchClient } from "./client";
import { getElasticsearchConfiguration } from "./config";
import { initElasticsearchWorker } from "./worker";

export { getElasticsearchConfiguration } from "./config";

/**
 * @typedef {Object} InitializeOptions
 * @param {Queue|undefined} queue
 * @param {NodeJS.ProcessEnv|Record<string,string>} env
 * @param {Sequelize|undefined} sequelize
 */

/**
 * @typedef {Object} InitializeResult
 * @param {boolean} enabled
 * @param {Function} handleAfterActivityReportDelete
 * @param {Function} handleAfterActivityReportSave
 * @param {Function} indexActivityReport
 * @param {Function} removeActivityReportFromIndex
 * @param {Function} searchActivityReports
 * @param {Function} startElasticsearchWorker
 */

/**
 * Intitializes Elasticsearch integration for the app--incorporates Sequelize
 * hooks used to keep ES up-to-date.
 * @return {InitializeResult}
 */
export function initElasticsearchIntegration({
  queue = undefined,
  models = undefined,
  env = process.env,
} = {}) {
  models = models || db;

  queue = queue || createElasticsearchQueue();

  const config = getElasticsearchConfiguration(env);

  const client = createElasticsearchClient(config);

  const {
    indexModel,
    removeModel,
    scheduleIndexModelJob,
    scheduleRemoveModelJob,
    startElasticsearchWorker,
  } = initElasticsearchWorker({
    client,
    env,
    models,
    queue,
  });


  const { ActivityReport } = models;

  if (config.enabled) {
    ActivityReport.addHook("afterSave", handleHook(scheduleIndexModelJob));
    ActivityReport.addHook("afterDestroy", handleHook(scheduleRemoveModelJob));
  }

  return {
    enabled: config.enabled,
    createElasticsearchClient,
    indexModel,
    removeModel,
    searchActivityReports: search.bind(undefined, "ActivityReport"),
    startElasticsearchWorker,
  };



  /**
   * @param {string} modelName
   * @param {string} text
   * @param {Client|undefined} client
   * @returns Promise<object> The full, unvarnished response from Elasticsearch.
   */
  async function search(modelName, text, client = undefined) {
    client = client || createElasticsearchClient();
    return client.search({
      q: text,
      index: modelNameToIndexName(modelName),
    });
  }
}

/**
 * Adapts a callback into a transaction-aware Sequelize hook handler.
 * @param {Function} callback 
 * @returns {Function}
 */
export function handleHook(callback) {
  return async (instance, { transaction }) => {
    if (transaction) {
      await transaction.afterCommit(() => callback(instance));
    } else {
      await callback(instance);
    }
  };
}

/**
 * Converts a Sequelize model name such that it can be used as an
 * Elasticsearch index name.
 * @param {string} modelName
 * @returns {string}
 */
export function modelNameToIndexName(modelName) {
  return snakeCase(modelName);
}
