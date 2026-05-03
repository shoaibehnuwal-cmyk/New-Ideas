import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.get('/:businessId', ReviewController.getReviews);
router.get('/:businessId/stats', ReviewController.getReviewStats);
router.post('/:businessId', ReviewController.addReview);
router.post('/reply/:reviewId', aiLimiter, ReviewController.generateReply);
router.post('/analyze/sentiment', aiLimiter, ReviewController.analyzeSentiment);
router.delete('/:reviewId', ReviewController.deleteReview);
router.get('/:businessId/insights', aiLimiter, ReviewController.getInsights);

export default router;
