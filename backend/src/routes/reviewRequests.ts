import { Router } from 'express';
import { ReviewRequestController } from '../controllers/reviewRequestController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const createRequestSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  channel: z.enum(['email', 'sms', 'qr']),
});

router.get('/:businessId', ReviewRequestController.getRequests);
router.post('/:businessId', validate(createRequestSchema), ReviewRequestController.createRequest);
router.get('/:businessId/qr', ReviewRequestController.generateQRCode);

export default router;
