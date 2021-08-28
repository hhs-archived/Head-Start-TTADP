# Elasticsearch

We use Elasticsearch to index Activity Reports and provide full-text search capabilities. In staging and production, this functionality is provided by [Cloud.gov][cg-elasticsearch]. Under the hood, this is AWS Elasticsearch. Locally, a single Elasticsearch node is included in the docker-compose environment.

## Architecture

_TODO: How ES fits into the existing application architecture_

## Local Development

### Exploring the Index

_TODO: Starting Kibana_

## Deployment

_TODO: How to configure ES environments_

## Maintenance

_TODO: How to re-index content_

[cg-elasticsearch]: https://cloud.gov/docs/services/aws-elasticsearch/
