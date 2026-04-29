import db from '../config/database';

export interface ReviewResponse {
  id: string;
  review_id: string;
  response_text: string;
  is_ai_generated: boolean;
  tone: 'professional' | 'friendly' | 'empathetic' | 'formal';
  status: 'draft' | 'sent' | 'published';
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const ReviewResponseModel = {
  tableName: 'review_responses',

  async findByReviewId(reviewId: string): Promise<ReviewResponse[]> {
    return db(this.tableName).where({ review_id: reviewId }).orderBy('created_at', 'desc');
  },

  async create(data: Partial<ReviewResponse>): Promise<ReviewResponse> {
    const [response] = await db(this.tableName).insert(data).returning('*');
    return response;
  },

  async update(id: string, data: Partial<ReviewResponse>): Promise<ReviewResponse> {
    const [response] = await db(this.tableName).where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return response;
  },
};
