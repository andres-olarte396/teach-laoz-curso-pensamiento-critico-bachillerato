import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../../../application/services/AuthService.js';
import { UpdateUser } from '../../../application/use-cases/user/UpdateUser.js';
import { z } from 'zod';
import { env } from '../../../infrastructure/config/environment.js';

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
  constructor(
    private authService: AuthService,
    private updateUserUseCase: UpdateUser
  ) {}

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
      name: user.name,
      role: user.role 
    });

    // Set Cookie
    const isSecure = env.COOKIE_SECURE;
    reply.setCookie('token', token, {
      path: '/',
      secure: isSecure,
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax', 
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
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
        name: user.name,
        role: user.role 
      });
  
      const isSecure = env.COOKIE_SECURE;
      reply.setCookie('token', token, {
        path: '/',
        secure: isSecure,
        httpOnly: true,
        sameSite: isSecure ? 'none' : 'lax',
      });
      return { user, token };
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return reply.code(409).send({ message: 'User already exists' });
      }
      throw error;
    }
  }

  async me(req: FastifyRequest, reply: FastifyReply) {
    const userPayload = req.user as any;
    if (!userPayload) {
      return reply.code(401).send({ message: 'Not authenticated' });
    }
    
    // Fetch fresh user data from DB instead of relying on stale token payload
    const user = await this.updateUserUseCase['userRepository'].findById(userPayload.id);
    
    if (!user) {
        return reply.code(404).send({ message: 'User not found' });
    }

    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl
      } 
    };
  }

  async update(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user as any;
    if (!user) {
      return reply.code(401).send({ message: 'Not authenticated' });
    }

    const body = req.body as { name?: string, email?: string, avatarUrl?: string };
    
    try {
      const updatedUser = await this.updateUserUseCase.execute(user.id, body);
       
      // If email changed, we might want to issue a new token or invalidate old ones, but for now simple update.
      
      return { 
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          avatarUrl: updatedUser.avatarUrl
        } 
      };
    } catch (error: any) {
       if (error.message === 'Email already taken') {
           return reply.code(409).send({ message: 'Email already taken' });
       }
       console.error(error);
       return reply.code(500).send({ message: 'Failed to update profile' });
    }
  }

  async changePassword(req: FastifyRequest, reply: FastifyReply) {
      const user = req.user as any;
      if (!user) {
          return reply.code(401).send({ message: 'Not authenticated' });
      }

      const { currentPassword, newPassword } = req.body as any;

      try {
          await this.authService.changePassword(user.id, currentPassword, newPassword);
          return reply.code(200).send({ message: 'Password updated successfully' });
      } catch (error: any) {
          if (error.message === 'Invalid current password') {
              return reply.code(400).send({ message: 'Invalid current password' });
          }
          console.error(error);
          return reply.code(500).send({ message: 'Failed to change password' });
      }
  }
}
