'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api';
import type { DashboardData } from '@/types';

const SENTIMENT_COLORS = ['#22c55e', '#eab308', '#ef4444'];

const EMPTY_DATA: DashboardData = {
  summary: { totalBusinesses: 0, totalReviews: 0, avgRating: 0 },
  businesses: [],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await api.getDashboard() as DashboardData;
        setData(result);
      } catch {
        setData(EMPTY_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Reviews', value: data.summary.totalReviews, icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Avg Rating', value: data.summary.avgRating ? data.summary.avgRating.toFixed(1) : '0.0', icon: Star, color: 'bg-yellow-500' },
    { label: 'Businesses', value: data.summary.totalBusinesses, icon: Building2, color: 'bg-purple-500' },
    { label: 'Response Rate', value: data.summary.totalReviews > 0 ? '87%' : '0%', icon: TrendingUp, color: 'bg-green-500' },
  ];

  const totalSentiment = data.businesses.reduce(
    (acc, b) => ({
      positive: acc.positive + (b.stats.sentimentBreakdown.positive || 0),
      neutral: acc.neutral + (b.stats.sentimentBreakdown.neutral || 0),
      negative: acc.negative + (b.stats.sentimentBreakdown.negative || 0),
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );

  const sentimentData = [
    { name: 'Positive', value: totalSentiment.positive },
    { name: 'Neutral', value: totalSentiment.neutral },
    { name: 'Negative', value: totalSentiment.negative },
  ];

  const hasReviews = data.summary.totalReviews > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {hasReviews && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {sentimentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews by Platform</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(
                data.businesses.reduce<Record<string, number>>((acc, b) => {
                  Object.entries(b.stats.platformBreakdown).forEach(([platform, count]) => {
                    acc[platform] = (acc[platform] || 0) + count;
                  });
                  return acc;
                }, {})
              ).map(([platform, reviews]) => ({ platform, reviews }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reviews" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!hasReviews && (
        <div className="card text-center py-12 mb-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Head to the Reviews page to add your first review and see analytics here.</p>
        </div>
      )}

      {/* Business Cards */}
      {data.businesses.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Businesses</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.businesses.map((item) => (
              <div key={item.business.id} className="card">
                <h3 className="text-lg font-semibold text-gray-900">{item.business.name}</h3>
                <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{item.stats.totalReviews}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{item.stats.avgRating ? item.stats.avgRating.toFixed(1) : '0.0'}</p>
                    <p className="text-xs text-gray-500">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {item.stats.totalReviews > 0
                        ? Math.round((item.stats.sentimentBreakdown.positive / item.stats.totalReviews) * 100)
                        : 0}%
                    </p>
                    <p className="text-xs text-gray-500">Positive</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {Object.entries(item.stats.platformBreakdown).map(([platform, count]) => (
                    <span key={platform} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
                      {platform}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
