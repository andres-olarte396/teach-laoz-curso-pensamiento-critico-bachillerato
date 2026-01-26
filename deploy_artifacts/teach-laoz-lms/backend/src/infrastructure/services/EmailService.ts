import { logger } from '../../shared/logger/logger.js';

export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export class ConsoleEmailService implements IEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    logger.info('📧 --- EMAIL SENT (SIMULATION) ---');
    logger.info(`To: ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Body: \n${body}`);
    logger.info('----------------------------------');
  }
}
