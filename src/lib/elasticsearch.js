// @ts-check
import { createAWSConnection } from "@acuris/aws-es-connection";
import AWS from "aws-sdk";
import { snakeCase} from "lodash";
import Sequelize, { Model, Transaction } from "sequelize";
import { Client, ClientOptions } from "@elastic/elasticsearch";
import { Queue } from "bull";
import { logger, auditLogger } from "../logger";
import newQueue from "./queue";

const INDEX_DOCUMENT = "index";
const REMOVE_FROM_INDEX = "removeFromIndex";

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
  sequelize = undefined,
  env = process.env,
} = {}) {
  if (!sequelize) {
    // NOTE: Mixing `import` and `require` here to speed up some unit tests
    sequelize = require("../models").sequelize;
  }

  if (!queue) {
    queue = newQueue("elasticsearch");
    queue.on("failed", (job, error) =>
      auditLogger.error(
        `job ${job.name} failed for report ${job.data.type} ${job.data.id} with error ${error}`
      )
    );
    queue.on("completed", (job, result) => {});
  }

  const { ActivityReport } = sequelize.models;

  const handleAfterActivityReportSave = handleAfterSave.bind(
    undefined,
    "ActivityReport"
  );
  const handleAfterActivityReportDestroy = handleAfterDestroy.bind(
    undefined,
    "ActivityReport"
  );

  ActivityReport.addHook("afterSave", handleAfterActivityReportSave);

  ActivityReport.addHook("afterDestroy", handleAfterActivityReportDestroy);

  return {
    enabled: true,
    createElasticsearchClient,
    handleAfterActivityReportDestroy,
    handleAfterActivityReportSave,
    indexActivityReport: index.bind(undefined, "ActivityReport"),
    removeActivityReportFromIndex: removeFromIndex.bind(
      undefined,
      "ActivityReport"
    ),
    searchActivityReports: search.bind(undefined, "ActivityReport"),
    processIndexJob,
    processRemoveFromIndexJob,
    startElasticsearchWorker,
  };

  /**
   * Creates an Elasticsearch client, configured from the environment.
   * @returns {Client}
   */
  function createElasticsearchClient() {
    const config = getElasticsearchConfiguration(env);

    if (!config.enabled) {
      throw new Error(
        "Elasticsearch support is not enabled in the application."
      );
    }

    /**
     * @type {ClientOptions}
     */
    let options = {
      node: config.node,
    };

    if (config.accessKeyId && config.secretKey) {
      // We need to configure our client to connect to AWS Elasticsearch.
      // AWS will require signed requests, which we handle using a separate library.
      const credentials = new AWS.Credentials(
        config.accessKeyId,
        config.secretKey
      );
      Object.assign(options, createAWSConnection(credentials));
    }

    return new Client(options);
  }

  /**
   * @param {string} modelName
   * @param {{id: any}} instance
   * @param {object} options
   * @param {Transaction|undefined} options.transaction
   * @returns {Promise<void>}
   */
  async function handleAfterSave(modelName, instance, { transaction }) {
    const id = instance.id;

    const scheduleIndex = () =>
      queue.add(INDEX_DOCUMENT, {
        type: modelName,
        id,
      });

    if (transaction) {
      transaction.afterCommit(scheduleIndex);
      return;
    }

    await scheduleIndex();
  }

  /**
   * @param {string} modelName
   * @param {{id: any}} instance
   * @param {object} options
   * @param {Transaction|undefined} options.transaction
   */
  async function handleAfterDestroy(modelName, instance, { transaction }) {
    const { id } = instance;
    const scheduleDelete = () =>
      queue.add(REMOVE_FROM_INDEX, {
        type: modelName,
        id,
      });

    if (transaction) {
      transaction.afterCommit(scheduleDelete);
      return;
    }

    await scheduleDelete();
  }

  /**
   * Deletes a model instance from the Elasticsearch index.
   * @param {string} modelName
   * @param {{id: any}} instance
   * @param {{delete: Function}|undefined} client
   */
  async function removeFromIndex(modelName, instance, client) {
    client = client || createElasticsearchClient();

    const id = String(instance.id);

    const params = {
      id,
      index: modelNameToIndexName(modelName),
      // TODO: `refresh` is required for our integration tests, but may not
      //       be necessary / benficial in prod. Possibly make it configurable
      //       via an argument?
      refresh: true,
    };

    await client.delete(params);
  }

  /**
   * Indexes a model instance.
   * @param {string} modelName
   * @param {{toJSON: Function}} instance
   * @param {{index: Function}|undefined} client
   */
  async function index(modelName, instance, client) {
    client = client || createElasticsearchClient();

    const { id, ...body } = instance.toJSON();

    await client.index({
      id: String(id),
      body,
      index: modelNameToIndexName(modelName),
      // TODO: `refresh` is required for our integration tests, but may not
      //       be necessary / benficial in prod. Possibly make it configurable
      //       via an argument?
      refresh: true,
    });
  }

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
      index: modelNameToIndexName(modelName)
    });
  }

  /**
   * Starts processing things on the search indexing queue.
   */
  function startElasticsearchWorker() {
    queue.process(INDEX_DOCUMENT, processIndexJob);
    queue.process(REMOVE_FROM_INDEX, processRemoveFromIndexJob);
  }

  /**
   *
   * @param {{name: "index", data: { id: any, type: string }}} job
   * @returns {Promise<void>}
   */
  async function processIndexJob(job) {
    const { type, id } = job.data;

    const modelType = sequelize.models[type];
    if (!modelType) {
      throw new Error(`Model ${type} was not found`);
    }

    const instance = modelType.findByPk(id);
    if (!instance) {
      // TODO: Throwing here may not make sense, as it will trigger a retry of the indexing job, which will also fail...
      throw new Error(`${type} #${id} was not found in the database.`);
    }

    await index(type, instance, undefined);
  }

  async function processRemoveFromIndexJob(job) {
    const { type, id } = job.data;

    const modelType = sequelize.models[type];
    if (!modelType) {
      throw new Error(`Model ${type} was not found`);
    }

    const instance = modelType.findByPk(id);
    if (!instance) {
      // TODO: Throwing here may not make sense, as it will trigger a retry of the indexing job, which will also fail...
      throw new Error(`${type} #${id} was not found in the database.`);
    }

    await removeFromIndex(type, instance, undefined);
  }
}

/**
 * @param {Dict<string>} env Environment variables to consider (defaults to `process.env`).
 * @returns {{enabled: false} | {enabled: true, node: string, accessKeyId?: string, secretKey?: string}}
 */
export function getElasticsearchConfiguration(env = process.env) {
  if (env.ELASTICSEARCH_NODE) {
    return {
      enabled: true,
      node: env.ELASTICSEARCH_NODE,
    };
  }

  const services =
    typeof env.VCAP_SERVICES === "string"
      ? JSON.parse(env.VCAP_SERVICES)
      : undefined;

  if (
    services &&
    services["aws-elasticsearch"] &&
    Array.isArray(services["aws-elasticsearch"])
  ) {
    const [service] = services["aws-elasticsearch"];
    if (service) {
      return {
        enabled: true,
        node: service.credentials.uri,
        accessKeyId: service.credentials.access_key,
        secretKey: service.credentials.secret_key,
      };
    }
  }

  return { enabled: false };
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