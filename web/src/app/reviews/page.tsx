'use client';

import { useState } from 'react';
import { Star, MessageSquare, Sparkles, Filter } from 'lucide-react';
import { cn, getSentimentColor, formatDate } from '@/lib/utils';
import type { Review } from '@/types';

const DEMO_REVIEWS: Review[] = [
  { id: '1', business_id: '1', platform: 'google', reviewer_name: 'Sarah Johnson', rating: 5, review_text: 'Absolutely wonderful experience! The staff was incredibly friendly and professional. Best dental visit I\'ve ever had.', sentiment: 'positive', sentiment_score: 0.95, is_responded: true, reviewed_at: '2024-03-15T10:30:00Z', created_at: '2024-03-15T10:30:00Z' },
  { id: '2', business_id: '1', platform: 'yelp', reviewer_name: 'Mike Chen', rating: 4, review_text: 'Great service and clean facility. Wait time was a bit long but overall satisfied.', sentiment: 'positive', sentiment_score: 0.72, is_responded: false, reviewed_at: '2024-03-14T14:00:00Z', created_at: '2024-03-14T14:00:00Z' },
  { id: '3', business_id: '1', platform: 'google', reviewer_name: 'Emma Wilson', rating: 2, review_text: 'Disappointed with the service. Had to wait over an hour past my appointment time and felt rushed during the actual visit.', sentiment: 'negative', sentiment_score: 0.18, is_responded: false, reviewed_at: '2024-03-13T09:00:00Z', created_at: '2024-03-13T09:00:00Z' },
  { id: '4', business_id: '1', platform: 'trustpilot', reviewer_name: 'James Brown', rating: 5, review_text: 'Top notch dental care. Dr. Smith is amazing and really takes time to explain everything.', sentiment: 'positive', sentiment_score: 0.91, is_responded: true, reviewed_at: '2024-03-12T16:30:00Z', created_at: '2024-03-12T16:30:00Z' },
  { id: '5', business_id: '1', platform: 'yelp', reviewer_name: 'Lisa Park', rating: 3, review_text: 'Average experience. Nothing special but nothing terrible either.', sentiment: 'neutral', sentiment_score: 0.5, is_responded: false, reviewed_at: '2024-03-11T11:00:00Z', created_at: '2024-03-11T11:00:00Z' },
];

export default function ReviewsPage() {
  const [reviews] = useState<Review[]>(DEMO_REVIEWS);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [generatedReply, setGeneratedReply] = useState<string>('');

  const filteredReviews = filter === 'all' ? reviews : reviews.filter((r) => r.sentiment === filter);

  function handleGenerateReply(review: Review) {
    setReplyingTo(review.id);
    // Simulate AI reply generation
    setTimeout(() => {
      const replies: Record<string, string> = {
        positive: `Thank you so much for your wonderful review! We're thrilled to hear about your positive experience and look forward to seeing you again.`,
        negative: `Thank you for sharing your feedback. We sincerely apologize for the inconvenience and would like the opportunity to make this right. Please reach out to us directly so we can address your concerns.`,
        neutral: `Thank you for your feedback! We appreciate you taking the time to share your experience. We're always looking for ways to improve and would love to hear more about how we can better serve you.`,
      };
      setGeneratedReply(replies[review.sentiment || 'neutral']);
    }, 1000);
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={cn('w-4 h-4', star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200')} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        {(['all', 'positive', 'neutral', 'negative'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors',
              filter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f} {f !== 'all' && `(${reviews.filter((r) => r.sentiment === f).length})`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
                  {review.reviewer_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-400 capitalize px-2 py-0.5 bg-gray-100 rounded">{review.platform}</span>
                    <span className="text-xs text-gray-400">{formatDate(review.reviewed_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {review.sentiment && (
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', getSentimentColor(review.sentiment))}>
                    {review.sentiment}
                  </span>
                )}
                {review.is_responded && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                    Responded
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 text-gray-700">{review.review_text}</p>

            {!review.is_responded && (
              <div className="mt-4">
                {replyingTo === review.id && generatedReply ? (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span className="text-sm font-medium text-brand-700">AI-Generated Reply</span>
                    </div>
                    <p className="text-sm text-gray-700">{generatedReply}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="btn-primary text-xs px-3 py-1">Send Reply</button>
                      <button className="btn-secondary text-xs px-3 py-1" onClick={() => handleGenerateReply(review)}>Regenerate</button>
                      <button className="btn-secondary text-xs px-3 py-1" onClick={() => { setReplyingTo(null); setGeneratedReply(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleGenerateReply(review)} className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Reply with AI
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
