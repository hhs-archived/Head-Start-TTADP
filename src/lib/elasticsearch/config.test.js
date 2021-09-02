import { getClientConfiguration } from "./config";

describe("Elasticsearch configuration", () => {
  describe("configuration", () => {
    describe("via ELASTICSEARCH_NODE", () => {
      test("is supported", () => {
        const config = getClientConfiguration({
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
        const config = getClientConfiguration({ VCAP_SERVICES });
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
      const config = getClientConfiguration({});
      expect(config).toHaveProperty("enabled", false);
    });

    test.todo("prefers VCAP_SERVICES over ELASTICSEARCH_NODE");
  });
});
