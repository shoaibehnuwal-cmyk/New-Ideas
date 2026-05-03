import db from '../config/database';

export interface Review {
  id: string;
  business_id: string;
  platform_id: string | null;
  platform: 'google' | 'yelp' | 'trustpilot' | 'facebook' | 'tripadvisor' | 'manual';
  platform_review_id: string | null;
  reviewer_name: string | null;
  reviewer_avatar_url: string | null;
  rating: number;
  review_text: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  sentiment_score: number | null;
  is_responded: boolean;
  reviewed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewFilters {
  businessId: string;
  platform?: string;
  sentiment?: string;
  rating?: number;
  isResponded?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const ReviewModel = {
  tableName: 'reviews',

  async findById(id: string): Promise<Review | undefined> {
    return db(this.tableName).where({ id }).first();
  },

  async findByBusinessId(filters: ReviewFilters): Promise<{ reviews: Review[]; total: number }> {
    const { businessId, platform, sentiment, rating, isResponded, startDate, endDate, page = 1, limit = 20 } = filters;

    let query = db(this.tableName).where({ business_id: businessId });

    if (platform) query = query.where({ platform });
    if (sentiment) query = query.where({ sentiment });
    if (rating) query = query.where({ rating });
    if (isResponded !== undefined) query = query.where({ is_responded: isResponded });
    if (startDate) query = query.where('reviewed_at', '>=', startDate);
    if (endDate) query = query.where('reviewed_at', '<=', endDate);

    const countResult = await query.clone().count('* as total').first();
    const total = Number(countResult?.total || 0);

    const reviews = await query
      .orderBy('reviewed_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return { reviews, total };
  },

  async create(data: Partial<Review>): Promise<Review> {
    const [review] = await db(this.tableName).insert(data).returning('*');
    return review;
  },

  async update(id: string, data: Partial<Review>): Promise<Review> {
    const [review] = await db(this.tableName).where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return review;
  },

  async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).delete();
    return count > 0;
  },

  async getStats(businessId: string): Promise<{
    totalReviews: number;
    avgRating: number;
    sentimentBreakdown: Record<string, number>;
    platformBreakdown: Record<string, number>;
  }> {
    const stats = await db(this.tableName)
      .where({ business_id: businessId })
      .select(
        db.raw('COUNT(*) as total_reviews'),
        db.raw('ROUND(AVG(rating), 2) as avg_rating')
      )
      .first();

    const sentimentCounts = await db(this.tableName)
      .where({ business_id: businessId })
      .groupBy('sentiment')
      .select('sentiment', db.raw('COUNT(*) as count'));

    const platformCounts = await db(this.tableName)
      .where({ business_id: businessId })
      .groupBy('platform')
      .select('platform', db.raw('COUNT(*) as count'));

    const sentimentBreakdown: Record<string, number> = {};
    sentimentCounts.forEach((row: { sentiment: string; count: string }) => {
      sentimentBreakdown[row.sentiment] = Number(row.count);
    });

    const platformBreakdown: Record<string, number> = {};
    platformCounts.forEach((row: { platform: string; count: string }) => {
      platformBreakdown[row.platform] = Number(row.count);
    });

    return {
      totalReviews: Number(stats?.total_reviews || 0),
      avgRating: Number(stats?.avg_rating || 0),
      sentimentBreakdown,
      platformBreakdown,
    };
  },
};
