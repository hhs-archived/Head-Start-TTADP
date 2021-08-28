const { REPORT_STATUSES } = require("../constants");
const {
  getElasticsearchConfiguration,
  initElasticsearchIntegration,
  modelNameToIndexName,
} = require("./elasticsearch");

describe("Elasticsearch", () => {
  describe("configuration", () => {
    describe("via ELASTICSEARCH_NODE", () => {
      test("is supported", () => {
        const config = getElasticsearchConfiguration({
          ...process.env,
          ELASTICSEARCH_NODE: "http://elasticsearch.node.example:1234",
        });
        expect(config).toHaveProperty("enabled", true);
        expect(config).toHaveProperty(
          "node",
          "http://elasticsearch.node.example:1234"
        );
        expect(config).not.toHaveProperty("accessKeyId");
        expect(config).not.toHaveProperty("secretKey");
      });
    });

    describe("via VCAP_SERVICES", () => {
      test("is supported", () => {
        const VCAP_SERVICES = JSON.stringify({
          "aws-elasticsearch": [
            {
              credentials: {
                uri: "http://aws-elasticsearch.node.example:1234",
                access_key: "ABCD",
                secret_key: "1234",
              },
            },
          ],
        });
        const config = getElasticsearchConfiguration({ VCAP_SERVICES });
        expect(config).toHaveProperty("enabled", true);
        expect(config).toHaveProperty(
          "node",
          "http://aws-elasticsearch.node.example:1234"
        );
        expect(config).toHaveProperty("accessKeyId", "ABCD");
        expect(config).toHaveProperty("secretKey", "1234");
      });
    });

    test("can be disabled", () => {
      const config = getElasticsearchConfiguration({});
      expect(config).toHaveProperty("enabled", false);
    });

    test.todo("prefers VCAP_SERVICES over ELASTICSEARCH_NODE");
  });

  describe("initialization", () => {
    const expectedHooks = ["afterDestroy", "afterSave"];
    expectedHooks.forEach((hook) => {
      test(`adds ${hook} hook to ActivityReport`, async () => {
        const addHook = jest.fn();
        const sequelize = {
          models: {
            ActivityReport: {
              addHook,
            },
          },
        };

        await initElasticsearchIntegration({
          env: {
            ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
          },
          sequelize,
        });

        expect(addHook).toHaveBeenCalledTimes(2);
        expect(addHook).toHaveBeenCalledWith(hook, expect.any(Function));
      });
    });

    test.todo("does not connect hooks when disabled");
  });

  describe("afterSave hook", () => {
    test("schedules es write immediately when no transaction", async () => {
      const addToQueue = jest.fn();
      const { handleAfterActivityReportSave } = initElasticsearchIntegration({
        env: {
          ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
        },
        queue: {
          add: addToQueue,
        },
      });
      await handleAfterActivityReportSave({ id: 1 }, {});
      expect(addToQueue).toHaveBeenCalledWith("index", {
        type: "ActivityReport",
        id: 1,
      });
    });
    test("delays es write until transaction is committed", async () => {
      const addToQueue = jest.fn();

      const { handleAfterActivityReportSave } = initElasticsearchIntegration({
        env: {
          ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
        },
        queue: {
          add: addToQueue,
        },
      });

      const afterCommit = jest.fn();

      const transaction = {
        afterCommit,
      };

      const options = {
        transaction,
      };

      await handleAfterActivityReportSave({ id: 1 }, options);

      expect(transaction.afterCommit).toHaveBeenCalledTimes(1);

      expect(addToQueue).not.toHaveBeenCalled();

      // Simulate the afterCommit() call on the transaction
      const afterCommitCallback = afterCommit.mock.calls[0][0];
      expect(afterCommitCallback).toEqual(expect.any(Function));

      await afterCommitCallback();

      expect(addToQueue).toHaveBeenCalledWith("index", {
        type: "ActivityReport",
        id: 1,
      });
    });
  });

  describe("afterDestroy hook", () => {
    test("schedules es delete immediately when no transaction", async () => {
      const addToQueue = jest.fn();
      const { handleAfterActivityReportDestroy } = initElasticsearchIntegration(
        {
          env: {
            ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
          },
          queue: {
            add: addToQueue,
          },
        }
      );

      await handleAfterActivityReportDestroy({ id: 1 }, {});

      expect(addToQueue).toHaveBeenCalledWith("removeFromIndex", {
        type: "ActivityReport",
        id: 1,
      });
    });
    test("delays es write until transaction is committed", async () => {
      const addToQueue = jest.fn();
      const { handleAfterActivityReportDestroy } = initElasticsearchIntegration(
        {
          env: { ELASTICSEARCH_NODE: "http://elasticsearch.node:1234" },
          queue: {
            add: addToQueue,
          },
        }
      );

      const afterCommit = jest.fn();

      const transaction = {
        afterCommit,
      };

      await handleAfterActivityReportDestroy({ id: 1 }, { transaction });

      expect(addToQueue).not.toHaveBeenCalled();

      expect(afterCommit).toHaveBeenCalledTimes(1);
      const afterCommitCallback = afterCommit.mock.calls[0][0];
      expect(afterCommitCallback).toEqual(expect.any(Function));

      await afterCommitCallback();

      expect(addToQueue).toHaveBeenCalledWith("removeFromIndex", {
        type: "ActivityReport",
        id: 1,
      });
    });
  });

  describe("worker", () => {
    test("runs correct jobs", () => {
      const queue = {
        add: jest.fn(),
        process: jest.fn(),
      };
      const {
        processIndexJob,
        processRemoveFromIndexJob,
        startElasticsearchWorker,
      } = initElasticsearchIntegration({
        env: { ELASTICSEARCH_NODE: "http://elasticsearch.node:1234" },
        queue,
      });

      startElasticsearchWorker();

      expect(queue.process).toHaveBeenCalledTimes(2);
      expect(queue.process).toHaveBeenCalledWith("index", processIndexJob);
      expect(queue.process).toHaveBeenCalledWith(
        "removeFromIndex",
        processRemoveFromIndexJob
      );
    });

    describe("indexing job", () => {
      describe("on save", () => {
        test("sends ActivityReport data to ES", async () => {
          const { indexActivityReport } = initElasticsearchIntegration({
            env: {
              ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
            },
          });

          const json = {
            id: 1,
            status: REPORT_STATUSES.DRAFT,
          };

          const instance = {
            toJSON: () => json,
          };

          const client = {
            index: jest.fn(),
          };

          await indexActivityReport(instance, client);

          expect(client.index).toHaveBeenCalledWith({
            id: "1",
            body: {
              status: REPORT_STATUSES.DRAFT,
            },
            index: "activity_report",
            refresh: true,
          });
        });
        test.todo("fails cleanly when ActivityReport not found on save");
      });
      describe("on delete", () => {
        test("removes ActivityReport data on delete", async () => {
          const { removeActivityReportFromIndex } =
            initElasticsearchIntegration({
              env: {
                ELASTICSEARCH_NODE: "http://elasticsearch.node:1234",
              },
            });

          const json = {
            id: 1,
            status: REPORT_STATUSES.DRAFT,
          };

          const instance = {
            id: 1,
            toJSON: () => json,
          };

          const client = {
            delete: jest.fn(),
          };

          await removeActivityReportFromIndex(instance, client);

          expect(client.delete).toHaveBeenCalledWith({
            id: "1",
            index: "activity_report",
            refresh: true,
          });
        });
        test.todo("does not throw when ActivityReport not found on save");
      });
    });
  });

  describe("utils", () => {
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
