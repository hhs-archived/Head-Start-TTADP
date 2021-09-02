// require('newrelic');

/* eslint-disable import/first */
import app from './app';
import { auditLogger } from './logger';
import { initElasticsearchIntegration  } from './lib/elasticsearch';
/* eslint-enable import/first */

initElasticsearchIntegration();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  auditLogger.info(`Listening on port ${port}`);
});

module.exports = server;
