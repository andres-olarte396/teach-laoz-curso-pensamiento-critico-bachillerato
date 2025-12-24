import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../../../infrastructure/database/sqlite.js';
import { ConsoleEmailService } from '../../../infrastructure/services/EmailService.js';
import { logger } from '../../../shared/logger/logger.js';
import { randomUUID } from 'crypto';

const emailService = new ConsoleEmailService();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export class ContactController {
  static async submit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = contactSchema.parse(request.body);

      // Save to Database
      const id = randomUUID();
      const stmt = db.prepare(`
        INSERT INTO contact_messages (id, name, email, subject, message)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(id, data.name, data.email, data.subject, data.message);

      // Send Email Notification
      await emailService.sendEmail(
        'admin@teachlaoz.com', // Internal admin email
        `New Contact Message: ${data.subject}`,
        `From: ${data.name} <${data.email}>\n\nMessage:\n${data.message}`
      );

      return reply.code(200).send({ message: 'Message sent successfully' });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Validation error', errors: error.errors });
      }
      logger.error('Error submitting contact form');
      console.error(error);
      return reply.code(500).send({ message: 'Internal server error' });
    }
  }
}
