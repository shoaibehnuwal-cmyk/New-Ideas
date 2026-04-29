import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const createBusinessSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const connectPlatformSchema = z.object({
  platform: z.enum(['google', 'yelp', 'trustpilot', 'facebook', 'tripadvisor']),
  platformBusinessId: z.string().optional(),
  platformUrl: z.string().url().optional(),
});

router.get('/', BusinessController.getBusinesses);
router.get('/:id', BusinessController.getBusiness);
router.post('/', validate(createBusinessSchema), BusinessController.createBusiness);
router.put('/:id', BusinessController.updateBusiness);
router.post('/:businessId/connect', validate(connectPlatformSchema), BusinessController.connectPlatform);
router.delete('/:businessId/platform/:platformId', BusinessController.disconnectPlatform);

export default router;
