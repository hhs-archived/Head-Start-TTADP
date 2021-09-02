import { createAWSConnection } from "@acuris/aws-es-connection";
import { Client, ClientOptions } from "@elastic/elasticsearch";
import { getElasticsearchConfiguration } from "./config";

/**
 * @typedef {Object} CreateElasticsearchClientOptions
 * @param {NodeJS.ProcessEnv|Dict<string>|undefined} env Environment variables to be considered.
 * @param {Object|undefined} config Elasticsearch configuration
 */

/**
 * Creates an Elasticsearch client, configured from the environment.
 * @param {CreateElasticsearchClientOptions} options
 * @returns {Client}
 */
export function createElasticsearchClient({ env, config } = {}) {
  config = config || getElasticsearchConfiguration(env || process.env);

  if (!config.enabled) {
    throw new Error("Elasticsearch support is not enabled in the application.");
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
