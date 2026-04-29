'use client';

import Link from 'next/link';
import { Star, Shield, BarChart3, MessageSquare, Zap, Globe, CheckCircle } from 'lucide-react';

const features = [
  { icon: Star, title: 'Review Collection', description: 'Send personalized review requests via email, SMS, or QR codes to real customers.' },
  { icon: MessageSquare, title: 'AI-Powered Replies', description: 'Generate professional, tone-appropriate responses to every review in seconds.' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track rating trends, sentiment analysis, and platform performance in real-time.' },
  { icon: Shield, title: 'Ethical Management', description: 'Only authentic reviews from real customers. No fake reviews or manipulation.' },
  { icon: Globe, title: 'Multi-Platform', description: 'Manage Google, Yelp, Trustpilot, and more from a single dashboard.' },
  { icon: Zap, title: 'Chrome Extension', description: 'Reply to reviews directly from Google Maps, Yelp, and Trustpilot pages.' },
];

const plans = [
  { name: 'Starter', price: 29, features: ['1 business location', '100 AI replies/month', 'Basic analytics', 'Email review requests', 'Google & Yelp integration'] },
  { name: 'Pro', price: 99, popular: true, features: ['5 business locations', '500 AI replies/month', 'Full analytics & insights', 'Email + SMS requests', 'All platform integrations', 'Priority support'] },
  { name: 'Agency', price: 299, features: ['Unlimited locations', 'Unlimited AI replies', 'Advanced analytics', 'White-label options', 'API access', 'Dedicated account manager'] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ReputationFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Log in</Link>
              <Link href="/auth/signup" className="btn-primary">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            100% Ethical Review Management
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-4xl mx-auto">
            Turn Happy Customers Into <span className="text-brand-600">5-Star Reviews</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Collect authentic reviews, respond with AI, and grow your online reputation across Google, Yelp, and Trustpilot &mdash; all from one dashboard.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
              Start Free 14-Day Trial
            </Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-3">
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Manage Your Reputation</h2>
            <p className="mt-4 text-lg text-gray-600">Powerful tools designed for local businesses in the US, UK, and EU.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-gray-600">Choose the plan that fits your business.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`card relative ${plan.popular ? 'border-brand-500 ring-2 ring-brand-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`mt-8 w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'} block text-center`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ReputationFlow</span>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} ReputationFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
