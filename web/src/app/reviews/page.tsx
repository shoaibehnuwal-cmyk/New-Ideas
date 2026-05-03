'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Sparkles, Filter, Plus, Trash2, X } from 'lucide-react';
import { cn, getSentimentColor, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Review } from '@/types';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [generatedReply, setGeneratedReply] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [newReview, setNewReview] = useState({
    reviewerName: '',
    rating: 5,
    reviewText: '',
    platform: 'google' as string,
  });
  const [addingReview, setAddingReview] = useState(false);

  const loadReviews = useCallback(async (bizId: string) => {
    try {
      const data = await api.getReviews(bizId) as { reviews: Review[] };
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      try {
        let businesses = await api.getBusinesses() as Array<{ id: string; name: string }>;
        if (cancelled) return;
        if (businesses.length === 0) {
          try {
            const biz = await api.createBusiness({ name: 'My Business', category: 'General' }) as { id: string };
            if (cancelled) return;
            setBusinessId(biz.id);
            await loadReviews(biz.id);
          } catch {
            if (cancelled) return;
            businesses = await api.getBusinesses() as Array<{ id: string; name: string }>;
            if (businesses.length > 0) {
              setBusinessId(businesses[0].id);
              await loadReviews(businesses[0].id);
            }
          }
        } else {
          setBusinessId(businesses[0].id);
          await loadReviews(businesses[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [loadReviews]);

  const filteredReviews = filter === 'all' ? reviews : reviews.filter((r) => r.sentiment === filter);

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    setAddingReview(true);
    try {
      await api.addReview(businessId, newReview);
      await loadReviews(businessId);
      setShowAddForm(false);
      setNewReview({ reviewerName: '', rating: 5, reviewText: '', platform: 'google' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
    } finally {
      setAddingReview(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!businessId) return;
    setDeletingId(reviewId);
    try {
      await api.deleteReview(reviewId);
      await loadReviews(businessId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  }

  function handleGenerateReply(review: Review) {
    setReplyingTo(review.id);
    setTimeout(() => {
      const replies: Record<string, string> = {
        positive: `Thank you so much for your wonderful review! We're thrilled to hear about your positive experience and look forward to seeing you again.`,
        negative: `Thank you for sharing your feedback. We sincerely apologize for the inconvenience and would like the opportunity to make this right. Please reach out to us directly so we can address your concerns.`,
        neutral: `Thank you for your feedback! We appreciate you taking the time to share your experience. We're always looking for ways to improve and would love to hear more about how we can better serve you.`,
      };
      setGeneratedReply(replies[review.sentiment || 'neutral']);
    }, 1000);
  }

  function renderStars(rating: number, interactive = false, onChange?: (r: number) => void) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200',
              interactive && 'cursor-pointer hover:text-yellow-300'
            )}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <button onClick={() => setShowAddForm(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 flex justify-between items-center">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Review</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={newReview.reviewerName}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, reviewerName: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={newReview.platform}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, platform: e.target.value }))}
                  className="input-field"
                >
                  <option value="google">Google</option>
                  <option value="yelp">Yelp</option>
                  <option value="trustpilot">Trustpilot</option>
                  <option value="facebook">Facebook</option>
                  <option value="manual">Manual Entry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {renderStars(newReview.rating, true, (r) => setNewReview((prev) => ({ ...prev, rating: r })))}
                  <span className="ml-2 text-sm text-gray-500">{newReview.rating}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                <textarea
                  required
                  value={newReview.reviewText}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, reviewText: e.target.value }))}
                  className="input-field min-h-[100px]"
                  placeholder="Write the review content..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addingReview} className="btn-primary flex-1">
                  {addingReview ? 'Adding...' : 'Add Review'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Empty state */}
      {reviews.length === 0 && (
        <div className="card text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500 mb-4">Add your first review to get started with reputation management.</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Review
          </button>
        </div>
      )}

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
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  disabled={deletingId === review.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
