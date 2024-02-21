if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  require('newrelic');
}

/* eslint-disable import/first */
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import app from './app';
import { auditLogger } from './logger';
import { generateRedisConfig } from './lib/queue';
/* eslint-enable import/first */

const bypassSockets = !!process.env.BYPASS_SOCKETS;

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  auditLogger.info(`Listening on port ${port}`); // Log server start
});

if (!bypassSockets) {
  const {
    uri: redisUrl,
    tlsEnabled,
  } = generateRedisConfig();

  // IIFE to get around top level awaits
  (async () => {
    try {
      const wss = new WebSocketServer({ server });
      auditLogger.info('WebSocket server started.'); // Log WebSocket server start

      const redisClient = createClient({
        url: redisUrl,
        socket: {
          tls: tlsEnabled,
        },
      });
      await redisClient.connect();
      auditLogger.info('Connected to Redis.'); // Log successful Redis connection

      wss.on('connection', async (ws, req) => {
        auditLogger.info(`New WebSocket connection: ${req.url}`); // Log new WebSocket connection

        const subscriber = redisClient.duplicate();
        await subscriber.connect();

        const channelName = req.url;
        await subscriber.subscribe(channelName, (message) => {
          ws.send(message);
          auditLogger.info(`Message sent to WebSocket client on channel ${channelName}`); // Log message sent to WebSocket client
        });

        ws.on('message', async (message) => {
          try {
            const { channel, ...data } = JSON.parse(message);
            await redisClient.publish(channel, JSON.stringify(data));
            auditLogger.info(`Message published to Redis on channel ${channel}`); // Log message published to Redis
          } catch (err) {
            auditLogger.error('WEBSOCKET: The following message was unable to be parsed and returned an error: ', message, err);
          }
        });

        ws.on('close', async () => {
          await subscriber.unsubscribe(channelName);
          auditLogger.info(`WebSocket client disconnected from channel ${channelName}`); // Log WebSocket client disconnection
        });
      });
    } catch (err) {
      auditLogger.error('Error setting up WebSocket server or Redis client:', err);
    }
  })();
}

export default server;
