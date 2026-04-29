import db from '../config/database';

export interface ConnectedPlatform {
  id: string;
  business_id: string;
  platform: 'google' | 'yelp' | 'trustpilot' | 'facebook' | 'tripadvisor';
  platform_business_id: string | null;
  platform_url: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: Date | null;
  is_connected: boolean;
  current_rating: number | null;
  total_reviews: number;
  last_synced_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const ConnectedPlatformModel = {
  tableName: 'connected_platforms',

  async findByBusinessId(businessId: string): Promise<ConnectedPlatform[]> {
    return db(this.tableName).where({ business_id: businessId });
  },

  async findByBusinessAndPlatform(businessId: string, platform: string): Promise<ConnectedPlatform | undefined> {
    return db(this.tableName).where({ business_id: businessId, platform }).first();
  },

  async create(data: Partial<ConnectedPlatform>): Promise<ConnectedPlatform> {
    const [conn] = await db(this.tableName).insert(data).returning('*');
    return conn;
  },

  async update(id: string, data: Partial<ConnectedPlatform>): Promise<ConnectedPlatform> {
    const [conn] = await db(this.tableName).where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return conn;
  },

  async disconnect(id: string): Promise<void> {
    await db(this.tableName).where({ id }).update({ is_connected: false, updated_at: new Date() });
  },
};
