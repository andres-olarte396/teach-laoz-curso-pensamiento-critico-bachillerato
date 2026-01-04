import { UserRepository } from '../../../domain/user/User.js';

export class UpdateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, data: { name?: string }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.name) {
      user.name = data.name;
    }
    
    // In future versions, update email or password if needed here.

    user.updatedAt = new Date();
    
    return this.userRepository.update(user);
  }
}
