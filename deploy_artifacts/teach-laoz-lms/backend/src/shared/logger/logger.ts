import pino from 'pino';
import { env } from '../../infrastructure/config/environment.js';

const isDevelopment = env.NODE_ENV !== 'production';
const logLevel = env.LOG_LEVEL;
const prettyPrint = env.LOG_PRETTY;

/**
 * Logger centralizado usando Pino
 */
export const logger = pino({
  level: logLevel,
  transport:
    isDevelopment && prettyPrint
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export default logger;
