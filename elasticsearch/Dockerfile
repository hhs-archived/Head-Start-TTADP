FROM docker.elastic.co/elasticsearch/elasticsearch:7.4.0

# NOTE: ingest-attachment is supported by default on AWS Elasticsearch.
RUN elasticsearch-plugin install --batch ingest-attachment