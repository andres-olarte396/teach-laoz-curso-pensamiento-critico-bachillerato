export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'student' | 'admin';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
