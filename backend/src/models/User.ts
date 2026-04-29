import db from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'owner' | 'manager' | 'staff';
  subscription_tier: 'free' | 'starter' | 'pro' | 'agency';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_ends_at: Date | null;
  is_active: boolean;
  email_verified_at: Date | null;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateUserInput = Pick<User, 'email' | 'password_hash' | 'first_name' | 'last_name'> & {
  phone?: string;
};

export const UserModel = {
  tableName: 'users',

  async findById(id: string): Promise<User | undefined> {
    return db(this.tableName).where({ id }).first();
  },

  async findByEmail(email: string): Promise<User | undefined> {
    return db(this.tableName).where({ email }).first();
  },

  async create(data: CreateUserInput): Promise<User> {
    const [user] = await db(this.tableName).insert(data).returning('*');
    return user;
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db(this.tableName).where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return user;
  },

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await db(this.tableName).where({ id }).update({ refresh_token: refreshToken });
  },

  async delete(id: string): Promise<void> {
    await db(this.tableName).where({ id }).delete();
  },
};
