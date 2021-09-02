const { REPORT_STATUSES } = require("../../../constants");
const { initElasticsearchIntegration, modelNameToIndexName, handleHook } = require("..");

describe("Elasticsearch", () => {
  describe("initialization", () => {
    const expectedHooks = ["afterDestroy", "afterSave"];
    expectedHooks.forEach((hook) => {
      test(`adds ${hook} hook to ActivityReport`, async () => {
        const addHook = jest.fn();
        const models = {
          ActivityReport: {
            addHook,
          },
        };

        await initElasticsearchIntegration({
          env: {
            ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
          },
          models,
        });

        expect(addHook).toHaveBeenCalledTimes(2);
        expect(addHook).toHaveBeenCalledWith(hook, expect.any(Function));
      });
    });

    test.todo("does not connect hooks when disabled");
  });

  describe("utils", () => {

    describe("handleHook", () => {
      it("attaches to transaction afterCommit handler when present", () => {
        const afterCommit = jest.fn();
        const callback = jest.fn();
        const handler = handleHook(callback)

        handler({}, { transaction: { afterCommit }});
        
        expect(callback).not.toHaveBeenCalled();
        expect(afterCommit).toHaveBeenCalled();
      });

      it("fires immediately when no transaction", () => {
        const callback = jest.fn();
        const handler = handleHook(callback);

        handler({}, {});

        expect(callback).toHaveBeenCalled();

      })
    })

    describe("modelNameToIndexName", () => {
      [
        ["Foo", "foo"],
        ["FooBar", "foo_bar"],
        ["Foo12Bar", "foo_12_bar"],
      ].forEach(([input, expected]) => {
        test(`${JSON.stringify(input)} --> ${JSON.stringify(expected)}`, () => {
          expect(modelNameToIndexName(input)).toBe(expected);
        });
      });
    });
  });
});
