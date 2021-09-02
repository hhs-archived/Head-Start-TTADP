const { ActivityReport } = require("../../models");
const { initElasticsearchWorker } = require("./worker");

describe("Elasticsearch worker", () => {
  describe("scheduleIndexModelJob", () => {
    test("adds to queue", () => {
      const queue = {
        add: jest.fn(),
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

  describe("startElasticsearchWorker", () => {
    test("runs correct jobs", () => {
      const queue = {
        add: jest.fn(),
        process: jest.fn(),
      };
      const {
        processIndexModelJob,
        processRemoveModelJob,
        startElasticsearchWorker,
      } = initElasticsearchWorker({
        env: { ELASTICSEARCH_NODE: "http://elasticsearch.node:1234" },
        queue,
      });

      startElasticsearchWorker();

      expect(queue.process).toHaveBeenCalledTimes(2);
      expect(queue.process).toHaveBeenCalledWith(
        "indexModel",
        processIndexModelJob
      );
      expect(queue.process).toHaveBeenCalledWith(
        "removeFromIndex",
        processRemoveFromIndexJob
      );
    });
  });
});
