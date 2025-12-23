import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../../../application/services/AuthService.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: FastifyRequest, reply: FastifyReply) {
    const body = loginSchema.parse(req.body);
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    // Generate Token
    const token = await reply.jwtSign({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    // Set Cookie
    reply.setCookie('token', token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax', // Needed for CORS/Auth to work easily in dev
    });

    return { user, token };
  }

  async register(req: FastifyRequest, reply: FastifyReply) {
    const body = registerSchema.parse(req.body);
    try {
      const user = await this.authService.register(body.email, body.password, body.name);
       // Generate Token for immediate login
       const token = await reply.jwtSign({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });
  
      reply.setCookie('token', token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
      });
      return { user, token };
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return reply.code(409).send({ message: 'User already exists' });
      }
      throw error;
    }
  }

  async me(req: FastifyRequest) {
    return req.user;
  }
}
