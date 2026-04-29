import db from '../config/database';

export interface ReviewRequest {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  channel: 'email' | 'sms' | 'qr';
  status: 'pending' | 'sent' | 'opened' | 'completed';
  review_link: string | null;
  qr_code_url: string | null;
  sent_at: Date | null;
  opened_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const ReviewRequestModel = {
  tableName: 'review_requests',

  async findByBusinessId(businessId: string, page = 1, limit = 20): Promise<{ requests: ReviewRequest[]; total: number }> {
    const countResult = await db(this.tableName).where({ business_id: businessId }).count('* as total').first();
    const total = Number(countResult?.total || 0);

    const requests = await db(this.tableName)
      .where({ business_id: businessId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return { requests, total };
  },

  async create(data: Partial<ReviewRequest>): Promise<ReviewRequest> {
    const [request] = await db(this.tableName).insert(data).returning('*');
    return request;
  },

  async updateStatus(id: string, status: ReviewRequest['status']): Promise<ReviewRequest> {
    const updates: Partial<ReviewRequest> = { status, updated_at: new Date() as unknown as Date };
    if (status === 'sent') updates.sent_at = new Date();
    if (status === 'opened') updates.opened_at = new Date();
    if (status === 'completed') updates.completed_at = new Date();

    const [request] = await db(this.tableName).where({ id }).update(updates).returning('*');
    return request;
  },
};
