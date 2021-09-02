// @ts-check

/**
 * @typedef {Object} ElasticsearchConfiguration
 * @param {boolean} enabled Whether Elasticsearch support is enabled in the app.
 * @param {string} node URL of the Elasticsearch node to use.
 * @param {string|undefined} accessKeyId AWS access key ID to use when signing requests (required for AWS Elasticsearch).
 * @param {string|undefined} secretKey AWS secret key to use when signing requests (required for AWS Elasticsearch).
 */

/**
 * @param {NodeJS.ProcessEnv|Dict<string>|undefined} env Environment variables to consider (defaults to `process.env`).
 * @returns {ElasticsearchConfiguration}
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
  
  