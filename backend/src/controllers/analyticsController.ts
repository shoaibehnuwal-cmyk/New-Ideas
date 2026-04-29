import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsSnapshotModel } from '../models/AnalyticsSnapshot';
import { ReviewModel } from '../models/Review';
import { BusinessModel } from '../models/Business';

export const AnalyticsController = {
  async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { startDate, endDate } = req.query;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const now = new Date();
      const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const defaultEnd = now.toISOString().split('T')[0];

      const snapshots = await AnalyticsSnapshotModel.getByBusinessId(
        businessId,
        (startDate as string) || defaultStart,
        (endDate as string) || defaultEnd
      );

      const stats = await ReviewModel.getStats(businessId);

      res.json({
        overview: stats,
        timeline: snapshots,
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  async getDashboardOverview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businesses = await BusinessModel.findByUserId(req.userId!);

      const overviews = await Promise.all(
        businesses.map(async (business) => {
          const stats = await ReviewModel.getStats(business.id);
          const latest = await AnalyticsSnapshotModel.getLatest(business.id);

          return {
            business: {
              id: business.id,
              name: business.name,
              slug: business.slug,
            },
            stats,
            latestSnapshot: latest,
          };
        })
      );

      const totalReviews = overviews.reduce((sum, o) => sum + o.stats.totalReviews, 0);
      const avgRating = overviews.length > 0
        ? overviews.reduce((sum, o) => sum + o.stats.avgRating, 0) / overviews.length
        : 0;

      res.json({
        summary: {
          totalBusinesses: businesses.length,
          totalReviews,
          avgRating: Math.round(avgRating * 100) / 100,
        },
        businesses: overviews,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  },
};
