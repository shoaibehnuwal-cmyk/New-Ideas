import db from '../config/database';

export interface AnalyticsSnapshot {
  id: string;
  business_id: string;
  snapshot_date: string;
  avg_rating: number | null;
  total_reviews: number;
  new_reviews: number;
  positive_reviews: number;
  neutral_reviews: number;
  negative_reviews: number;
  responded_reviews: number;
  review_requests_sent: number;
  review_requests_completed: number;
  response_rate: number | null;
  platform_breakdown: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export const AnalyticsSnapshotModel = {
  tableName: 'analytics_snapshots',

  async getByBusinessId(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<AnalyticsSnapshot[]> {
    return db(this.tableName)
      .where({ business_id: businessId })
      .whereBetween('snapshot_date', [startDate, endDate])
      .orderBy('snapshot_date', 'asc');
  },

  async getLatest(businessId: string): Promise<AnalyticsSnapshot | undefined> {
    return db(this.tableName)
      .where({ business_id: businessId })
      .orderBy('snapshot_date', 'desc')
      .first();
  },

  async upsert(data: Partial<AnalyticsSnapshot>): Promise<AnalyticsSnapshot> {
    const existing = await db(this.tableName)
      .where({ business_id: data.business_id, snapshot_date: data.snapshot_date })
      .first();

    if (existing) {
      const [snapshot] = await db(this.tableName)
        .where({ id: existing.id })
        .update({ ...data, updated_at: new Date() })
        .returning('*');
      return snapshot;
    }

    const [snapshot] = await db(this.tableName).insert(data).returning('*');
    return snapshot;
  },
};
