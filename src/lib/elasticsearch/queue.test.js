import { createElasticsearchQueue } from "./queue";

describe("Elasticsearch queue", () => {
  test("gets created", () => {
    const queue = createElasticsearchQueue();
    expect(queue).not.toBeUndefined();
  });
});
