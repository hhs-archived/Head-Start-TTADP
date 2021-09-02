// @ts-check

import Sequelize, { Model, Transaction } from "sequelize";
import { createAWSConnection } from "@acuris/aws-es-connection";
import { Client, ClientOptions } from "@elastic/elasticsearch";
import { Queue } from "bull";
import db from "../../models";
import { logger, auditLogger } from "../../logger";

import { createElasticsearchQueue } from "./queue";
import { createElasticsearchClient } from "./client";
import {
  getClientConfiguration,  
} from "./config";
import { handleHook, modelNameToIndexName } from "./utils";
import { initElasticsearchWorker } from "./worker";

/**
 * @typedef {Object} InitializeOptions
 * @param {NodeJS.ProcessEnv|Record<string,string>} env
 * @param {boolean} configureMappings Whether to configure Elasticsearch mappings during initialization
 * @param {boolean} configurePipelines Whether to configure Elasticsearch pipelines during initialization
 * @param {Queue|undefined} queue
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
 * Intitializes Elasticsearch integration for the app.
 * @return {InitializeResult}
 */
export function initElasticsearchIntegration({
  configureMappings = false,
  configurePiplines = false,
  queue = undefined,
  models = undefined,
  env = process.env,
} = {}) {
  models = models || db;

  queue = queue || createElasticsearchQueue();

  const config = getClientConfiguration(env);

  const client = createElasticsearchClient(config);

  const {
    indexModel,
    removeModel,
    scheduleIndexFileJob,
    scheduleIndexModelJob,
    scheduleRemoveFileJob,
    scheduleRemoveModelJob,
    startElasticsearchWorker,
  } = initElasticsearchWorker({
    configureMappings,
    configurePiplines,
    client,
    env,
    models,
    queue,
  });

  const { ActivityReport, File } = models;

  if (config.enabled) {
    ActivityReport.addHook("afterSave", handleHook(scheduleIndexModelJob));
    ActivityReport.addHook("afterDestroy", handleHook(scheduleRemoveModelJob));

    File.addHook("afterSave", handleHook(scheduleIndexFileJob));
    File.addHook("afterDestroy", handleHook(scheduleRemoveFileJob));
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
