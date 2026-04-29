import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BusinessModel } from '../models/Business';
import { ConnectedPlatformModel } from '../models/ConnectedPlatform';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export const BusinessController = {
  async getBusinesses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businesses = await BusinessModel.findByUserId(req.userId!);
      res.json(businesses);
    } catch (error) {
      console.error('Get businesses error:', error);
      res.status(500).json({ error: 'Failed to fetch businesses' });
    }
  },

  async getBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const business = await BusinessModel.findById(id);

      if (!business || business.user_id !== req.userId) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }

      const platforms = await ConnectedPlatformModel.findByBusinessId(id);
      res.json({ ...business, connectedPlatforms: platforms });
    } catch (error) {
      console.error('Get business error:', error);
      res.status(500).json({ error: 'Failed to fetch business' });
    }
  },

  async createBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, category, phone, email, website, address, city, state, country, postalCode } = req.body;

      let slug = slugify(name);
      const existingSlug = await BusinessModel.findBySlug(slug);
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      const business = await BusinessModel.create({
        user_id: req.userId!,
        name,
        slug,
        description,
        category,
        phone,
        email,
        website,
        address,
        city,
        state,
        country,
        postal_code: postalCode,
      });

      res.status(201).json(business);
    } catch (error) {
      console.error('Create business error:', error);
      res.status(500).json({ error: 'Failed to create business' });
    }
  },

  async updateBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const business = await BusinessModel.findById(id);

      if (!business || business.user_id !== req.userId) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }

      const updated = await BusinessModel.update(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Update business error:', error);
      res.status(500).json({ error: 'Failed to update business' });
    }
  },

  async connectPlatform(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { platform, platformBusinessId, platformUrl } = req.body;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const existing = await ConnectedPlatformModel.findByBusinessAndPlatform(businessId, platform);
      if (existing) {
        const updated = await ConnectedPlatformModel.update(existing.id, {
          platform_business_id: platformBusinessId,
          platform_url: platformUrl,
          is_connected: true,
        });
        res.json(updated);
        return;
      }

      const connection = await ConnectedPlatformModel.create({
        business_id: businessId,
        platform,
        platform_business_id: platformBusinessId,
        platform_url: platformUrl,
      });

      res.status(201).json(connection);
    } catch (error) {
      console.error('Connect platform error:', error);
      res.status(500).json({ error: 'Failed to connect platform' });
    }
  },

  async disconnectPlatform(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId, platformId } = req.params;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      await ConnectedPlatformModel.disconnect(platformId);
      res.json({ message: 'Platform disconnected' });
    } catch (error) {
      console.error('Disconnect error:', error);
      res.status(500).json({ error: 'Failed to disconnect platform' });
    }
  },
};
