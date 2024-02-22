import Queue from 'bull';
import { auditLogger } from '../logger';

const generateRedisConfig = (enableRateLimiter = false) => {
  auditLogger.info('Generating Redis configuration');

  if (process.env.VCAP_SERVICES) {
    const {
      'aws-elasticache-redis': [{
        credentials: {
          host,
          port,
          password,
          uri,
        },
      }],
    } = JSON.parse(process.env.VCAP_SERVICES);

    let redisSettings = {
      uri,
      host,
      port,
      tlsEnabled: true,
      redisOpts: {
        redis: { password, tls: {} },
      },
    };

    auditLogger.debug('VCAP_SERVICES detected, using cloud configuration', redisSettings);

    if (enableRateLimiter) {
      redisSettings = {
        ...redisSettings,
        redisOpts: {
          ...redisSettings.redisOpts,
          limiter: {
            max: process.env.REDIS_LIMITER_MAX || 1000,
            duration: process.env.REDIS_LIMITER_DURATION || 300000,
          },
        },
      };

      auditLogger.debug('Rate limiter enabled', {
        max: redisSettings.redisOpts.limiter.max,
        duration: redisSettings.redisOpts.limiter.duration,
      });
    }

    return redisSettings;
  }

  const { REDIS_HOST: host, REDIS_PASS: password } = process.env;
  const redisSettings = {
    host,
    uri: `redis://:${password}@${host}:${process.env.REDIS_PORT || 6379}`,
    port: (process.env.REDIS_PORT || 6379),
    tlsEnabled: false,
    redisOpts: {
      redis: { password },
    },
  };

  auditLogger.debug('Using local configuration', redisSettings);

  return redisSettings;
};

const {
  host,
  port,
  redisOpts,
} = generateRedisConfig(true);

export { generateRedisConfig };

export async function increaseListeners(queue, num = 1) {
  const MAX_LISTENERS = 20;
  const redisClient = queue.client;
  if (redisClient) {
    const maxListeners = redisClient.getMaxListeners();
    const currentCounts = queue.eventNames().reduce((counts, eventName) => ({
      ...counts,
      [eventName]: queue.listenerCount(eventName),
    }), {});
    const totalCount = Object.values(currentCounts).reduce((acc, count) => acc + count, 0);
    const newListenerCount = Math.min(totalCount + num, MAX_LISTENERS);

    // Log the current state before any changes
    auditLogger.info(`Current max listeners: ${maxListeners}, total listeners: ${totalCount}, requested increase: ${num}`);

    if (newListenerCount > maxListeners) {
      redisClient.setMaxListeners(newListenerCount);

      // Log the change in max listeners
      auditLogger.info(`Increased max listeners to: ${newListenerCount}`);
    } else {
      // Log that no change was necessary
      auditLogger.info(`No need to increase max listeners. Current max is sufficient.`);
    }
  } else {
    // Log an error if the redisClient is not available
    auditLogger.error(`Failed to increase listeners: redisClient is not available.`);
  }
}

function removeQueueEventHandlers(
  queue,
  errorListener,
  shutdownListener,
  exceptionListener,
  rejectionListener,
) {
  queue.removeListener('error', errorListener); // removeListener does not return a Promise
  process.removeListener('SIGINT', shutdownListener);
  process.removeListener('SIGTERM', shutdownListener);
  process.removeListener('uncaughtException', exceptionListener);
  process.removeListener('unhandledRejection', rejectionListener);
}

// Define the handlers so they can be added and removed
function handleShutdown(queue) {
  return () => {
    auditLogger.error('Shutting down, closing queue...');
    queue.close().then(() => {
      auditLogger.error('Queue closed successfully.');
      removeQueueEventHandlers(queue);
      process.exit(0);
    }).catch((err) => {
      auditLogger.error('Failed to close the queue:', err);
      removeQueueEventHandlers(queue);
      process.exit(1);
    });
  };
}

function handleException(queue) {
  return (err) => {
    auditLogger.error('Uncaught exception:', err);
    queue.close().then(() => {
      auditLogger.error('Queue closed after uncaught exception.');
      removeQueueEventHandlers(queue);
      process.exit(1);
    }).catch((closeErr) => {
      auditLogger.error('Failed to close the queue after uncaught exception:', closeErr);
      removeQueueEventHandlers(queue);
      process.exit(1);
    });
  };
}

function handleRejection(queue) {
  return (reason, promise) => {
    auditLogger.error('Unhandled rejection at:', promise, 'reason:', reason);
    queue.close().then(() => {
      auditLogger.error('Queue closed after unhandled rejection.');
      removeQueueEventHandlers(queue);
      process.exit(1);
    }).catch((closeErr) => {
      auditLogger.error('Failed to close the queue after unhandled rejection:', closeErr);
      removeQueueEventHandlers(queue);
      process.exit(1);
    });
  };
}

// Setup event handlers
function setupQueueEventHandlers(queue) {
  const shutdownListener = handleShutdown(queue);
  const exceptionListener = handleException(queue);
  const rejectionListener = handleRejection(queue);

  const errorListener = (err) => {
    auditLogger.error('Queue encountered an error:', err);
    queue.close().then(() => {
      auditLogger.error('Queue closed due to an error.');
      removeQueueEventHandlers(
        queue,
        errorListener,
        shutdownListener,
        exceptionListener,
        rejectionListener,
      );
    }).catch((closeErr) => {
      auditLogger.error('Failed to close the queue after an error:', closeErr);
      removeQueueEventHandlers(
        queue,
        errorListener,
        shutdownListener,
        exceptionListener,
        rejectionListener,
      );
    });
  };

  queue.on('error', errorListener);
  process.on('SIGINT', shutdownListener);
  process.on('SIGTERM', shutdownListener);
  process.on('uncaughtException', exceptionListener);
  process.on('unhandledRejection', rejectionListener);
}

function setRedisConnectionName(queue, connectionName) {
  const { client } = queue;
  if (client && client.call) {
    client.call('client', 'setname', connectionName).catch((err) => {
      auditLogger.error('Failed to set Redis connection name:', err);
    });
  }
}

export default function newQueue(queName) {
  const queue = new Queue(queName, `redis://${host}:${port}`, redisOpts);
  setRedisConnectionName(queue, `${process.argv[1]?.split('/')?.slice(-1)[0]?.split('.')?.[0]}-${queName}-${process.pid}`);
  // setupQueueEventHandlers(queue); // TODO - currently causing mor errors then fixing
  return queue;
}
