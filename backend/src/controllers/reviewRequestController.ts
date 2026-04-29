import { Response } from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { ReviewRequestModel } from '../models/ReviewRequest';
import { BusinessModel } from '../models/Business';
import { env } from '../config/env';

export const ReviewRequestController = {
  async getRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { page, limit } = req.query;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const result = await ReviewRequestModel.findByBusinessId(
        businessId,
        Number(page) || 1,
        Number(limit) || 20
      );

      res.json(result);
    } catch (error) {
      console.error('Get requests error:', error);
      res.status(500).json({ error: 'Failed to fetch review requests' });
    }
  },

  async createRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { customerName, customerEmail, customerPhone, channel } = req.body;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const reviewLink = `${env.frontendUrl}/review/${business.slug}/${uuidv4().substring(0, 8)}`;

      let qrCodeUrl: string | null = null;
      if (channel === 'qr') {
        qrCodeUrl = await QRCode.toDataURL(reviewLink, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
      }

      const request = await ReviewRequestModel.create({
        business_id: businessId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        channel,
        review_link: reviewLink,
        qr_code_url: qrCodeUrl,
      });

      // In production, send email/SMS here via SendGrid/Twilio
      if (channel === 'email' && customerEmail) {
        await ReviewRequestModel.updateStatus(request.id, 'sent');
      } else if (channel === 'sms' && customerPhone) {
        await ReviewRequestModel.updateStatus(request.id, 'sent');
      }

      res.status(201).json(request);
    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({ error: 'Failed to create review request' });
    }
  },

  async generateQRCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;

      const business = await BusinessModel.findById(businessId);
      if (!business || business.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const reviewLink = `${env.frontendUrl}/review/${business.slug}`;
      const qrCodeUrl = await QRCode.toDataURL(reviewLink, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });

      res.json({ qrCode: qrCodeUrl, reviewLink });
    } catch (error) {
      console.error('QR code error:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  },
};
