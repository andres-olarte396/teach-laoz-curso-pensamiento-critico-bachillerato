import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRepository } from '../../domain/user/User.js';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(email: string, password: string, name: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: uuidv4(),
      email,
      passwordHash,
      name,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.userRepository.create(newUser);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid current password');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    
    // Check if repository has updatePassword method (Cast to avoid interface limitation if not updated yet in IUserRepository)
    // Assuming we updated interface or implementation.
    const repo = this.userRepository as any; 
    if (typeof repo.updatePassword === 'function') {
        await repo.updatePassword(userId, newHash);
    } else {
        // Fallback or Error
        throw new Error('Repository does not support password updates');
    }
  }
}