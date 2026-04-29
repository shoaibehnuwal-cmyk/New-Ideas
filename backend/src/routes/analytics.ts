import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', AnalyticsController.getDashboardOverview);
router.get('/:businessId', AnalyticsController.getAnalytics);

export default router;
