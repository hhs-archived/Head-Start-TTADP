import { snakeCase } from "lodash";
import { Model, Transaction } from "sequelize";

/**
 * Adapts a callback into a transaction-aware Sequelize hook handler.
 * `callback` will be be fired:
 *   - Immediately if no transaction is in use
 *   - Once the transaction is committed otherwise
 * @param {(instance: Model) => void | Promise<void>} callback
 * @returns {(instance: Model, { transaction: (Transaction | undefined)}) => Promise<void>}
 */
export function handleHook(callback) {
  return async function hookHandler(instance, { transaction }) {
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

