import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReviewModel } from '../models/Review';
import { ReviewResponseModel } from '../models/ReviewResponse';
import { BusinessModel } from '../models/Business';
import { AIService } from '../services/aiService';

export const ReviewController = {
  async getReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { platform, sentiment, rating, isResponded, startDate, endDate, page, limit } = req.query;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const result = await ReviewModel.findByBusinessId({
        businessId,
        platform: platform as string,
        sentiment: sentiment as string,
        rating: rating ? Number(rating) : undefined,
        isResponded: isResponded !== undefined ? isResponded === 'true' : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      res.json({
        reviews: result.reviews,
        total: result.total,
        page: Number(page) || 1,
        totalPages: Math.ceil(result.total / (Number(limit) || 20)),
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  },

  async getReviewStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const stats = await ReviewModel.getStats(businessId);
      res.json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  },

  async generateReply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const { tone = 'professional' } = req.body;

      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      const business = await BusinessModel.findById(review.business_id);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const result = await AIService.generateReply(
        review.review_text || '',
        review.rating,
        business.name,
        tone
      );

      const response = await ReviewResponseModel.create({
        review_id: reviewId,
        response_text: result.reply,
        is_ai_generated: true,
        tone: tone as 'professional' | 'friendly' | 'empathetic' | 'formal',
        status: 'draft',
      });

      res.json({ response, generatedReply: result.reply });
    } catch (error) {
      console.error('Reply generation error:', error);
      res.status(500).json({ error: 'Failed to generate reply' });
    }
  },

  async analyzeSentiment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reviewText } = req.body;

      if (!reviewText) {
        res.status(400).json({ error: 'Review text is required' });
        return;
      }

      const result = await AIService.analyzeSentiment(reviewText);
      res.json(result);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
  },

  async addReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { platform, reviewerName, rating, reviewText, reviewedAt } = req.body;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      let sentiment: 'positive' | 'neutral' | 'negative' | undefined;
      let sentimentScore: number | undefined;

      if (reviewText) {
        const analysis = await AIService.analyzeSentiment(reviewText);
        sentiment = analysis.sentiment;
        sentimentScore = analysis.score;
      }

      const review = await ReviewModel.create({
        business_id: businessId,
        platform: platform || 'manual',
        reviewer_name: reviewerName,
        rating,
        review_text: reviewText,
        sentiment,
        sentiment_score: sentimentScore,
        reviewed_at: reviewedAt || new Date(),
      });

      res.status(201).json(review);
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  },

  async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;

      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      const business = await BusinessModel.findById(review.business_id);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      await ReviewModel.delete(reviewId);
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  },

  async getInsights(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const { reviews } = await ReviewModel.findByBusinessId({ businessId, limit: 50 });
      const insights = await AIService.generateBusinessInsights(
        reviews.map((r) => ({
          review_text: r.review_text || '',
          rating: r.rating,
          sentiment: r.sentiment || 'neutral',
        }))
      );

      res.json({ insights });
    } catch (error) {
      console.error('Insights error:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  },
};
