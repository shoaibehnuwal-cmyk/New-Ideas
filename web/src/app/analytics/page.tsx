'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Star, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const RATING_TREND = [
  { date: 'Week 1', google: 4.2, yelp: 3.9, trustpilot: 4.0 },
  { date: 'Week 2', google: 4.3, yelp: 4.0, trustpilot: 4.1 },
  { date: 'Week 3', google: 4.3, yelp: 4.1, trustpilot: 4.2 },
  { date: 'Week 4', google: 4.4, yelp: 4.1, trustpilot: 4.3 },
  { date: 'Week 5', google: 4.5, yelp: 4.2, trustpilot: 4.3 },
  { date: 'Week 6', google: 4.5, yelp: 4.3, trustpilot: 4.4 },
];

const SENTIMENT_TREND = [
  { month: 'Oct', positive: 18, neutral: 5, negative: 3 },
  { month: 'Nov', positive: 22, neutral: 4, negative: 2 },
  { month: 'Dec', positive: 20, neutral: 6, negative: 4 },
  { month: 'Jan', positive: 28, neutral: 3, negative: 1 },
  { month: 'Feb', positive: 25, neutral: 5, negative: 2 },
  { month: 'Mar', positive: 30, neutral: 4, negative: 1 },
];

const PLATFORM_BREAKDOWN = [
  { name: 'Google', value: 140, color: '#4285F4' },
  { name: 'Yelp', value: 72, color: '#D32323' },
  { name: 'Trustpilot', value: 35, color: '#00B67A' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const kpis = [
    { label: 'Avg Rating', value: '4.5', change: '+0.3', positive: true, icon: Star },
    { label: 'New Reviews', value: '35', change: '+12%', positive: true, icon: MessageSquare },
    { label: 'Response Rate', value: '92%', change: '+5%', positive: true, icon: TrendingUp },
    { label: 'Negative Reviews', value: '1', change: '-67%', positive: true, icon: TrendingDown },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <kpi.icon className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
            <p className={`text-sm mt-1 ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change} vs last period
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={RATING_TREND}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[3.5, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="google" stroke="#4285F4" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="yelp" stroke="#D32323" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="trustpilot" stroke="#00B67A" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SENTIMENT_TREND}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="neutral" fill="#eab308" stackId="a" />
              <Bar dataKey="negative" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews by Platform</h2>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={PLATFORM_BREAKDOWN} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {PLATFORM_BREAKDOWN.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
