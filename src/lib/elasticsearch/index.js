// @ts-check

import { Client, ClientOptions } from "@elastic/elasticsearch";
import { createAWSConnection } from "@acuris/aws-es-connection";
import { createElasticsearchClient } from "./client";
import { createElasticsearchQueue } from "./queue";
import { handleHook, modelNameToIndexName } from "./utils";
import { initElasticsearchWorker } from "./worker";
import { logger, auditLogger } from "../../logger";
import { MAPPINGS } from "./mappings";
import { PIPELINES } from "./pipelines";
import { Queue } from "bull";
import { getClientConfiguration } from "./config";
import db from "../../models";
import Sequelize, { Model, Transaction } from "sequelize";

const INDICES = ["ActivityReport", "File"].map(modelNameToIndexName);

/**
 * @typedef {Object} InitializeOptions
 * @param {NodeJS.ProcessEnv|Record<string,string>} env
 * @param {boolean} configureMappings Whether to configure Elasticsearch mappings during initialization
 * @param {boolean} configurePipelines Whether to configure Elasticsearch pipelines during initialization
 * @param {Queue|undefined} queue
 * @param {boolean} recreateIndices Whether to re-create Elasticsearch indices on startup. This is useful in development while working on mappings
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
 * @return {Promise<InitializeResult>}
 */
export async function initElasticsearchIntegration({
  configureMappings = false,
  configurePipelines = false,
  env = process.env,
  models = undefined,
  queue = undefined,
  recreateIndices = false,
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

    const shouldMessWithElasticsearch = configureMappings || configurePipelines;

    if (shouldMessWithElasticsearch) {
      await createIndices();

      await Promise.all(
        [
          configureMappings && doMappingConfig(),
          configurePipelines && doPipelineConfig(),
        ].filter((x) => x)
      );
    }
  }

  return {
    enabled: config.enabled,
    createElasticsearchClient,
    indexModel,
    removeModel,
    startElasticsearchWorker,
  };

  function doMappingConfig() {
    // See mappings.js for the actual mapping configuration
    return Object.keys(MAPPINGS).reduce(
      (p, modelName) =>
        p.then(async () => {
          const mapping = MAPPINGS[modelName];
          if (!mapping) {
            logger.info(`Not configuring mapping for model ${modelName}`);
            return;
          }
          logger.info(`Configuring mapping for model ${modelName}`);
          const result = await client.indices.putMapping({
            index: modelNameToIndexName(modelName),
            body: mapping,
          });
          logger.debug(JSON.stringify(result));
          logger.info(`Configured mapping for model ${modelName}`);
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
          logger.info(`Configuring pipeline ${id}...`);
          const result = await client.ingest.putPipeline({
            id,
            body: pipeline,
          });
          if (logger.isDebugEnabled) {
            logger.debug(`Configured pipeline ${id}. Got ${JSON.stringify(result)}`)
          }
        }),
      Promise.resolve()
    );
  }

  function createIndices() {
    return Promise.all(INDICES.map(createIndex));

    async function createIndex(indexName) {
      logger.info(`Attempting to create index ${indexName}...`);
      try {
        await client.indices.create({
          index: indexName,
        });
        logger.info(`Created index ${indexName}`);
      } catch (err) {
        const alreadyExisted =
          err.meta.body.error.type === "resource_already_exists_exception";
        if (!alreadyExisted) {
          throw err;
        }

        if (recreateIndices) {
          logger.warn(
            `Index ${indexName} already existed. Deleting and re-creating...`
          );
          await client.indices.delete({ index: indexName });
          await client.indices.create({
            index: indexName,
          });
          logger.warn(`Re-created index ${indexName}`);
        }
      }
    }
  }
}
