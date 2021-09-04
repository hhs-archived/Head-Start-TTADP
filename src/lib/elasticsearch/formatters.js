import { activityReportById } from "../../services/activityReports";

const CUSTOM_FORMATTERS = {
  ActivityReport: async (instance) => {
    const report = await activityReportById(instance.id);
    return report.toJSON();
  },
};

/**
 * @param {Model} instance Sequelize instance to be formatted.
 * @returns {Promise<object>} A JSON document for storage in Elasticsearch.
 */
export async function formatModelForElasticsearch(instance) {
  const customFormatter = CUSTOM_FORMATTERS[instance.constructor.name];
  if (customFormatter) {
    return await customFormatter(instance);
  }

  return instance.toJSON();
}
