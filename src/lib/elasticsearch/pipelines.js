export const PIPELINES = {
  attachment: {
    description: "Extract attachment information",
    processors: [
      {
        attachment: {
          field: "data",
          properties: ["content", "title"],
        },
      },
    ],
  },
};
