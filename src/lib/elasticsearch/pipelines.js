/**
 * These are the fields on ActivityReport that contain HTML. We use the
 * html_strip processor on them to remove HTML tags.
 * More info: https://www.elastic.co/guide/en/elasticsearch/reference/current/htmlstrip-processor.html
 */
const ACTIVITY_REPORT_HTML_FIELDS = [
  // "goals.objectives.ttaProvided",
  "additionalNotes",
  "context",
];

export const PIPELINES = {
  ActivityReport: {
    description: "Processes incoming Activity Reports",
    processors: [
      ...ACTIVITY_REPORT_HTML_FIELDS.map((field) => ({
        html_strip: {
          field,
        },
      })),
    ],
  },
  File: {
    description: "Processes incoming file attachments",
    processors: [
      {
        attachment: {
          field: "data",
          properties: ["content", "title"],
        },
      },
      // After indexing text content, remove base64-encoded file
      {
        remove: {
          field: "data"
        }
      }
    ],
  },
};
