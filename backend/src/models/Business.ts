import db from '../config/database';

export interface Business {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  logo_url: string | null;
  timezone: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type CreateBusinessInput = Pick<Business, 'user_id' | 'name' | 'slug'> & Partial<Business>;

export const BusinessModel = {
  tableName: 'businesses',

  async findById(id: string): Promise<Business | undefined> {
    return db(this.tableName).where({ id }).first();
  },

  async findByUserId(userId: string): Promise<Business[]> {
    return db(this.tableName).where({ user_id: userId, is_active: true });
  },

  async findBySlug(slug: string): Promise<Business | undefined> {
    return db(this.tableName).where({ slug }).first();
  },

  async create(data: CreateBusinessInput): Promise<Business> {
    const [business] = await db(this.tableName).insert(data).returning('*');
    return business;
  },

  async update(id: string, data: Partial<Business>): Promise<Business> {
    const [business] = await db(this.tableName).where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return business;
  },

  async delete(id: string): Promise<void> {
    await db(this.tableName).where({ id }).update({ is_active: false });
  },
};
