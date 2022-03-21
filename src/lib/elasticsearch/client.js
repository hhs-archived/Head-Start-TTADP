import { createAWSConnection } from '@acuris/aws-es-connection';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { getClientConfiguration } from './config';

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
export default function createElasticsearchClient({ env, config } = {}) {
  const localConfig = config || getClientConfiguration(env || process.env);

  if (!localConfig.enabled) {
    throw new Error('Elasticsearch support is not enabled in the application.');
  }

  /**
   * @type {ClientOptions}
   */
  const options = {
    node: localConfig.node,
  };

  if (localConfig.accessKeyId && localConfig.secretKey) {
    // We need to configure our client to connect to AWS Elasticsearch.
    // AWS will require signed requests, which we handle using a separate library.
    const credentials = new AWS.Credentials(
      localConfig.accessKeyId,
      localConfig.secretKey,
    );
    Object.assign(options, createAWSConnection(credentials));
  }

  return new Client(options);
}
