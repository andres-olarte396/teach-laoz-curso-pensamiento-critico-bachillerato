import 'dotenv/config';
import { logger } from './shared/logger/logger.js';
import { createServer } from './interface/http/app.js';
import { env } from './infrastructure/config/environment.js';

/**
 * Entry point de la aplicación
 */
async function bootstrap() {
  try {
    logger.info('🚀 Starting Teach LAOZ LMS...');
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Host: ${env.HOST}`);
    logger.info(`Port: ${env.PORT}`);

    const server = await createServer();
    
    await server.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`📚 Server listening on http://${env.HOST}:${env.PORT}`);
    logger.info(`📂 Content base path: ${env.CONTENT_BASE_PATH}`);
  } catch (err) {
    logger.error(err, '❌ Failed to start server');
    process.exit(1);
  }
}

bootstrap();
// Restart trigger
