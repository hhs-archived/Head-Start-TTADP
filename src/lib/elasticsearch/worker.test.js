const { ActivityReport, File } = require("../../models");
const { initElasticsearchWorker } = require("./worker");

describe("Elasticsearch worker", () => {
  describe("scheduleIndexModelJob", () => {
    test("adds to queue", () => {
      const queue = {
        add: jest.fn(),
        process: jest.fn(),
      };

      const { scheduleIndexModelJob } = initElasticsearchWorker({
        queue,
      });

      const instance = ActivityReport.build({
        id: 1234,
      });

      scheduleIndexModelJob(instance);

      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(queue.add).toHaveBeenCalledWith("indexModel", {
        type: "ActivityReport",
        id: 1234,
      });
    });
  });

  describe("scheduleRemoveModelJob", () => {
    test("adds to queue", () => {
      const queue = {
        add: jest.fn(),
        process: jest.fn(),
      };

      const { scheduleRemoveModelJob } = initElasticsearchWorker({
        queue,
      });

      const instance = ActivityReport.build({
        id: 1234,
      });

      scheduleRemoveModelJob(instance);

      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(queue.add).toHaveBeenCalledWith("removeModel", {
        type: "ActivityReport",
        id: 1234,
      });
    });
  });

  describe("processIndexModelJob", () => {
    test("sends ActivityReport data to ES", async () => {
      const client = {
        index: jest.fn(),
      };

      const models = {
        ActivityReport: {
          findByPk: (id) =>
            Promise.resolve(
              ActivityReport.build({
                id,
              })
            ),
        },
      };

      const { processIndexModelJob } = initElasticsearchWorker({
        client,
        models,
      });

      await processIndexModelJob({
        data: {
          type: "ActivityReport",
          id: 1234,
        },
      });

      expect(client.index).toHaveBeenCalledTimes(1);
      expect(client.index).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1234",
          index: "activity_report",
          body: expect.any(Object), // TODO: More detailed check
          refresh: true,
        })
      );
    });

    test.todo("fails correctly when ActivityReport not found on save");
  });

  describe("processRemoveModelJob", () => {
    test("removes ActivityReport data on delete", async () => {
      const client = {
        delete: jest.fn(),
      };

      const models = {
        ActivityReport: {
          findByPk: (id) =>
            Promise.resolve(
              ActivityReport.build({
                id,
              })
            ),
        },
      };

      const { processRemoveModelJob } = initElasticsearchWorker({
        client,
        models,
      });

      await processRemoveModelJob({
        data: {
          type: "ActivityReport",
          id: 1234,
        },
      });

      expect(client.delete).toHaveBeenCalledWith({
        id: "1234",
        index: "activity_report",
        refresh: true,
      });
    });
    test.todo("does not throw when ActivityReport not found on save");
  });

  describe("File support", () => {
    [
      ["scheduleIndexFileJob", "indexFile"],
      ["scheduleRemoveFileJob", "removeFile"],
    ].forEach(([funcName, jobName]) => {
      test(funcName, () => {
        const file = File.build({
          id: 1234,
        });
        const queue = {
          add: jest.fn(),
          process: jest.fn(),
        };

        const result = initElasticsearchWorker({
          queue,
        });
        const func = result[funcName];

        func(file);

        expect(queue.add).toHaveBeenCalledWith(jobName, {
          id: 1234,
        });
      });
    });

    describe("processIndexFileJob", () => {
      [
        "UPLOADING",
        "UPLOADED",
        "UPLOAD_FAILED",
        "QUEUEING_FAILED",
        "SCANNING_QUEUED",
        "SCANNING",
        "SCANNING_FAILED",
        "REJECTED",
      ].forEach((status) => {
        describe(status, () => {
          test.todo(`fails`);
        });
      });

      describe("APPROVED", () => {
        test("succeeds", async () => {
          const downloadFile = jest.fn();
          downloadFile.mockResolvedValue({
            Body: Buffer.from("hello world", "utf-8"),
          });

          const client = {
            index: jest.fn(),
          };

          const { processIndexFileJob } = initElasticsearchWorker({
            client,
            downloadFile,
            models: {
              File: {
                findByPk: (id) =>
                  Promise.resolve(
                    File.build({
                      id,
                      activityReportId: 99,
                      key: "test/key",
                    })
                  ),
              },
            },
          });

          await processIndexFileJob({
            name: "",
            data: {
              id: 1234,
            },
          });

          expect(downloadFile).toHaveBeenCalledWith("test/key");

          expect(client.index).toHaveBeenCalledTimes(1);

          expect(client.index).toHaveBeenCalledWith({
            index: "file",
            id: "1234",
            body: {
              activityReportId: "99",
              data: "aGVsbG8gd29ybGQ=",
            },
            pipeline: "File",
            refresh: true,
          });
        });
      });
    });

    describe("processRemoveFileJob", () => {
      test("deletes files", async () => {
        const client = {
          delete: jest.fn(),
        };

        const { processRemoveFileJob } = initElasticsearchWorker({
          client,
        });

        await processRemoveFileJob({
          name: "removeFile",
          data: {
            id: 1234,
          },
        });

        expect(client.delete).toHaveBeenCalledWith({
          index: "file",
          id: "1234",
          refresh: true,
        });
      });
    });
  });

  describe("startElasticsearchWorker", () => {
    test("runs correct jobs", () => {
      const queue = {
        add: jest.fn(),
        process: jest.fn(),
      };
      const {
        processIndexFileJob,
        processIndexModelJob,
        processRemoveFileJob,
        processRemoveModelJob,
        startElasticsearchWorker,
      } = initElasticsearchWorker({
        env: { ELASTICSEARCH_NODE: "http://elasticsearch.node:1234" },
        queue,
      });

      startElasticsearchWorker();

      expect(queue.process).toHaveBeenCalledTimes(4);
      expect(queue.process).toHaveBeenCalledWith(
        "indexModel",
        processIndexModelJob
      );
      expect(queue.process).toHaveBeenCalledWith(
        "removeModel",
        processRemoveModelJob
      );
      expect(queue.process).toHaveBeenCalledWith(
        "indexFile",
        processIndexFileJob
      );
      expect(queue.process).toHaveBeenCalledWith(
        "removeFile",
        processRemoveFileJob
      );
    });
  });
});
