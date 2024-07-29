/* eslint-disable import/first */
if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  require('newrelic');
}

import {} from 'dotenv/config';
import throng from 'throng';
import { loadModels } from "./models";

loadModels();

// Number of workers to spawn
const workers = process.env.WORKER_CONCURRENCY || 2;

// Pull jobs off the redis queue and process them.
async function start(context: { id: number }) {
  // File Scanning Queue
  (await import('./services/scanQueue')).processScanQueue();

  // S3 Queue.
  (await import('./services/s3Queue')).processS3Queue();

  // Resource Queue.
  (await import('./services/resourceQueue')).processResourceQueue();

  // Notifications Queue
  (await import('./lib/mailer')).processNotificationQueue();

  // Maintenance Queue
  (await import('./lib/maintenance')).processMaintenanceQueue();
}

// spawn workers and start them
throng({ workers, start });
