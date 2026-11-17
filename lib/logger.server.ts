import pino, { type DestinationStream, type Logger } from 'pino';
import 'server-only';

const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];

/** Creates a server logger with an optional output destination. */
export function createLogger(destination?: DestinationStream): Logger {
  const configuredLevel = process.env.LOG_LEVEL;
  return pino(
    {
      name: 'commission-quote',
      level: configuredLevel && levels.includes(configuredLevel) ? configuredLevel : 'info',
      redact: {
        paths: [
          'apiKey',
          '["api-key"]',
          'COMMISSION_VENDOR_API_KEY',
          'authorization',
          'cookie',
          'headers',
          'req',
          'res',
          'request',
          'response',
          'body',
        ],
        remove: true,
      },
    },
    destination
  );
}

export const logger: Logger = createLogger();
