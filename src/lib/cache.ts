import { createClient } from 'redis';
import { generateRedisConfig } from './queue';
import { auditLogger } from '../logger';

interface CacheOptions {
  EX?: number; // time in seconds
}

/**
 *
 * @param {string} key the key to use for the cache
 * @param {function} reponseCallback will be called if the cache is empty (must return a string)
 * @param {function} outputCallback will be called to format the output, defaults to a passthrough
 * @param options see the interface above, defaults to 10 minutes
 * @returns Promise<string | null>, the cached response or null if there was an error
 */
export default async function getCachedResponse(
  key: string,
  reponseCallback: () => Promise<string>,
  outputCallback: ((foo: string) => string) | JSON['parse'] = (foo: string) => foo,
  options: CacheOptions = {
    EX: 600,
  },
): Promise<string | null> {
  const {
    uri: redisUrl,
    tlsEnabled,
  } = generateRedisConfig();

  // you can set ignore cache in your .env file to ignore the cache
  // for debugging and testing purposes
  const ignoreCache = process.env.IGNORE_CACHE === 'true';

  if (ignoreCache) {
    auditLogger.info(`Ignoring cache for ${key}`);
  }

  // we create a fake redis client because we don't want to fail the request if redis is down
  // or if we can't connect to it, or whatever else might go wrong
  let redisClient = {
    connect: () => Promise.resolve(),
    get: (_k: string) => Promise.resolve(null),
    set: (_k: string, _r: string | null, _o: CacheOptions) => Promise.resolve(''),
    quit: () => Promise.resolve(),
  };

  let clientConnected = false;
  let response: string | null = null;

  try {
    if (!ignoreCache) {
      auditLogger.info(`Attempting to connect to Redis for key: ${key}`);
      redisClient = createClient({
        // ... configuration ...
      });
      await redisClient.connect();
      auditLogger.info(`Connected to Redis for key: ${key}`);
      response = await redisClient.get(key);
      if (response) {
        auditLogger.info(`Cache hit for key: ${key}`);
      } else {
        auditLogger.info(`Cache miss for key: ${key}`);
      }
      clientConnected = true;
    }
  } catch (err) {
    auditLogger.error('Error creating & connecting to redis client', { err });
  }

  // if we do not have a response, we need to call the callback
  if (!response) {
    auditLogger.info(`Fetching new data for key: ${key}`);
    response = await reponseCallback();
    // and then, if we have a response and we are connected to redis, we need to set the cache
    if (response && clientConnected) {
      try {
        await redisClient.set(key, response, options);
        await redisClient.quit();
      } catch (err) {
        auditLogger.error('Error setting cache response', { err });
      }
    }
  }

  if (outputCallback) {
    auditLogger.info(`Formatting response for key: ${key}`);
    return outputCallback(response);
  }

  auditLogger.info(`Returning response for key: ${key}`);
  return response;
}
