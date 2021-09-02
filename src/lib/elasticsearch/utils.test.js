import { handleHook, modelNameToIndexName } from "./utils";

describe("Elasticsearch utils", () => {
  describe("handleHook", () => {
    it("attaches to transaction afterCommit handler when present", () => {
      const afterCommit = jest.fn();
      const callback = jest.fn();
      const handler = handleHook(callback);

      handler({}, { transaction: { afterCommit } });

      expect(callback).not.toHaveBeenCalled();
      expect(afterCommit).toHaveBeenCalled();
    });

    it("fires immediately when no transaction", () => {
      const callback = jest.fn();
      const handler = handleHook(callback);

      handler({}, {});

      expect(callback).toHaveBeenCalled();
    });
  });

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
