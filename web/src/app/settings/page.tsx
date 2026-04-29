'use client';

import { useState } from 'react';
import { Save, Globe, CreditCard, CheckCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'google', name: 'Google Business', connected: true, icon: '🔍', reviews: 140, rating: 4.5 },
  { id: 'yelp', name: 'Yelp', connected: true, icon: '⭐', reviews: 72, rating: 4.2 },
  { id: 'trustpilot', name: 'Trustpilot', connected: false, icon: '✅', reviews: 0, rating: 0 },
  { id: 'facebook', name: 'Facebook', connected: false, icon: '👤', reviews: 0, rating: 0 },
  { id: 'tripadvisor', name: 'TripAdvisor', connected: false, icon: '🦉', reviews: 0, rating: 0 },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 29, features: ['1 business', '100 AI replies/mo', 'Basic analytics'] },
  { id: 'pro', name: 'Pro', price: 99, current: true, features: ['5 businesses', '500 AI replies/mo', 'Full analytics', 'SMS requests'] },
  { id: 'agency', name: 'Agency', price: 299, features: ['Unlimited businesses', 'Unlimited AI replies', 'White-label', 'API access'] },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'platforms' | 'billing'>('profile');
  const [profile, setProfile] = useState({
    businessName: 'Downtown Dental',
    email: 'admin@downtowndental.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, San Francisco, CA 94102',
    website: 'https://downtowndental.com',
    category: 'Dentist',
  });

  const tabs = [
    { id: 'profile' as const, label: 'Business Profile', icon: Globe },
    { id: 'platforms' as const, label: 'Connected Accounts', icon: Globe },
    { id: 'billing' as const, label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })} className="input-field" />
              </div>
            </div>
            <button className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Platforms Tab */}
      {tab === 'platforms' && (
        <div className="space-y-4 max-w-2xl">
          {PLATFORMS.map((platform) => (
            <div key={platform.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{platform.name}</p>
                  {platform.connected && (
                    <p className="text-sm text-gray-500">{platform.reviews} reviews &middot; {platform.rating} avg rating</p>
                  )}
                </div>
              </div>
              {platform.connected ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </span>
                  <button className="btn-secondary text-xs px-2 py-1">Disconnect</button>
                </div>
              ) : (
                <button className="btn-primary text-sm">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Billing Tab */}
      {tab === 'billing' && (
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl">
          {PLANS.map((plan) => (
            <div key={plan.id} className={cn('card relative', plan.current && 'border-brand-500 ring-2 ring-brand-500')}>
              {plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="ml-1 text-gray-500">/mo</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={cn('mt-4 w-full', plan.current ? 'btn-secondary' : 'btn-primary')}>
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
