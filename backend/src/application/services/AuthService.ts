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
}
