import { createServer } from './app.js';
import { env } from '../../infrastructure/config/environment.js';
import { logger } from '../../shared/logger/logger.js';

async function start() {
  try {
    const server = await createServer();
    
    await server.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`🚀 Server listening on http://${env.HOST}:${env.PORT}`);
    logger.info(`📚 Course content path: ${env.CONTENT_BASE_PATH}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

start();
