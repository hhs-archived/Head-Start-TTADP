const {
  initElasticsearchIntegration,
} = require("..");

describe("Elasticsearch", () => {
  describe("initialization", () => {
    const expectedModelsAndHooks = {
      ActivityReport: ["afterDestroy", "afterSave"],
      File: ["afterDestroy", "afterSave"],
    };

    const models = Object.keys(expectedModelsAndHooks).reduce(
      (obj, modelName) => {
        obj[modelName] = {
          addHook: jest.fn(),
        };
        return obj;
      },
      {}
    );

    beforeAll(async () => {
      await initElasticsearchIntegration({
        env: {
          ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
        },
        models,
      });
    });

    Object.keys(expectedModelsAndHooks).forEach((modelName) => {
      const expectedHooks = expectedModelsAndHooks[modelName];
      const { addHook } = models[modelName];
      expectedHooks.forEach((hook) => {
        test(`adds ${hook} hook to ${modelName}`, async () => {
          expect(addHook).toHaveBeenCalledWith(hook, expect.any(Function));
        });
      });
    });

    test.todo("does not connect hooks when disabled");
  });
});
