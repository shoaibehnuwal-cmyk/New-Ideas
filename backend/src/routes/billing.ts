import { Router } from 'express';
import { BillingController } from '../controllers/billingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/plans', BillingController.getPlans);
router.post('/checkout', authenticate, BillingController.createCheckoutSession);
router.post('/webhook', BillingController.handleWebhook);

export default router;
