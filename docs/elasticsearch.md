# Elasticsearch

Elasticsearch is a document-oriented data store with a very advanced [search API][es-search-api]. In short: You throw JSON data at Elasticsearch, then later you can search that data. Elasticsearch writes happen with eventual consistency. This means it is probably not a great choice for a primary data store for typical CRUD scenarios.

The TTA Hub uses [Elasticsearch][elasticsearch] to index Activity Reports and provide full-text search capabilities. In staging and production, this functionality is provided by [Cloud.gov][cg-elasticsearch]. For local development, a single Elasticsearch node is included in the `docker-compose` environment. Elasticsearch is a **secondary** datastore that should be regarded as ephemeral--over time, all Activity Report data that is written to Postgres should _also_ be written to Elasticsearch and available for searching, but it may also occasionally go out-of-sync with Postgres or need to be completely re-indexed.

## Integration Details

The application communicates with the Elasticsearch cluster in a manner similar to how it communicates with Postgres. Client configuration details (endpoints, access keys, etc.) are provided via the `VCAP_SERVICES` environment variable in the cloud.gov environment. Application code creates an [Elasticsearch client][es-client], configures it appropriately, then uses it to submit and query for data.
### Use of Sequelize Hooks

The Elasticsearch code uses [Sequelize hooks][sequelize-hooks] to know _when_ to write data to Elasticsearch. As Activity Reports are saved (or destroyed), these custom hooks schedule Worker jobs to propagate the changes from Postgres to Elasticsearch.

### Worker

Only the Worker (background task queue) writes to Elasticsearch. The reasons for this are:

1. **A failed Elasticsearch write should not interrupt the user's day.** If we fail to write to the application's _primary_ data store (Postgres), the user should know their data has not actually been saved. But Elasticsearch is a secondary data store, and absolutely not the user's problem.
2. **Elasticsearch writes will be eventually consistent anyway.** It is not guaranteed that, immediately after a write, a request for the same data will return what was written. So introducing an additional delay to the write for worker processing is not a big deal.

### Mappings

It is possible not to tell Elasticsearch about the shape of your data, and let it infer a schema from what you send it. In practice though, you will want to configure [mappings][es-mappings] that instruct Elasticsearch how certain data fields should be stored. Mappings are used to answer questions like:

1. Does the text in this field need to be full text searchable (like the "Comments" field on a feedback form) or can it be restricted to exact matches only (like the "Department" field on a feedback form)?
2. What format is used by the application to represent dates and times?

Mappings are configured in application code in [`lib/elasticsearch/mappings.js`](../src/lib/elasticsearch/mappings.js).

### Ingest Pipelines

If your data needs to be transformed or normalized before storage, Elasticsearch provides a feature called [Ingest Pipelines][es-pipelines] that can be used to do this processing. Example uses of pipelines are:

- Stripping HTML tags from fields containing rich-formatted text (you likely don't want user input matching against raw HTML tags)
- Indexing text content inside common document formats (.pdf, .docx, etc.) using the [Ingest Attachment Processor plugin][ingest-attachment]

Pipelines are configured in application code in [`lib/elasticsearch/pipelines.js`](../src/lib/elasticsearch/pipelines.js).

## Hazards and Pitfalls

### Amazon / Elastic conflict

Elasticsearch in cloud.gov is [AWS OpenSearch][aws-opensearch] (previously AWS Elasticsearch) under the hood. "OpenSearch" is AWS's fork of the Elasticsearch product. Newer versions of official Elastic clients have added code to detect when they are communicating with forked Elasticsearch servers and refuse to run. For now, pinning `@elastic/elasticsearch` to version 7.13.0 (the last version without this check) works. In the future, we may want to evaluate any official clients published by AWS / OpenSearch.

[elasticsearch]: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
[cg-elasticsearch]: https://cloud.gov/docs/services/aws-elasticsearch/
[es-client]: https://www.npmjs.com/package/@elastic/elasticsearch/v/7.13.0
[sequelize-hooks]: https://sequelize.org/master/manual/hooks.html
[es-pipelines]: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
[ingest-attachment]: https://www.elastic.co/guide/en/elasticsearch/plugins/current/ingest-attachment.html
[aws-opensearch]: https://aws.amazon.com/opensearch-service/
[es-mappings]: https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html