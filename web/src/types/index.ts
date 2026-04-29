export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionTier: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface Review {
  id: string;
  business_id: string;
  platform: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  sentiment_score: number | null;
  is_responded: boolean;
  reviewed_at: string;
  created_at: string;
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  response_text: string;
  is_ai_generated: boolean;
  tone: string;
  status: string;
}

export interface ReviewRequest {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  channel: string;
  status: string;
  review_link: string | null;
  qr_code_url: string | null;
  sent_at: string | null;
}

export interface AnalyticsSnapshot {
  snapshot_date: string;
  avg_rating: number;
  total_reviews: number;
  new_reviews: number;
  positive_reviews: number;
  neutral_reviews: number;
  negative_reviews: number;
}

export interface DashboardData {
  summary: {
    totalBusinesses: number;
    totalReviews: number;
    avgRating: number;
  };
  businesses: Array<{
    business: { id: string; name: string; slug: string };
    stats: {
      totalReviews: number;
      avgRating: number;
      sentimentBreakdown: Record<string, number>;
      platformBreakdown: Record<string, number>;
    };
  }>;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}
