import { auditLogger } from '../../logger';
import newQueue from '../queue';

export default function createElasticsearchQueue() {
  const queue = newQueue('elasticsearch');
  queue.on('failed', (job, error) => auditLogger.error(`job ${job.name} failed for report ${job.data.type} ${job.data.id} with error ${error}`));
  return queue;
}
