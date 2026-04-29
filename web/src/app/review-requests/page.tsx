'use client';

import { useState } from 'react';
import { Send, Mail, Phone, QrCode, Plus, Copy, Check } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { ReviewRequest } from '@/types';

const DEMO_REQUESTS: ReviewRequest[] = [
  { id: '1', business_id: '1', customer_name: 'John Smith', customer_email: 'john@example.com', customer_phone: null, channel: 'email', status: 'completed', review_link: 'https://reputationflow.com/review/downtown-dental/abc123', qr_code_url: null, sent_at: '2024-03-14T10:00:00Z' },
  { id: '2', business_id: '1', customer_name: 'Amy Wilson', customer_email: null, customer_phone: '+1234567890', channel: 'sms', status: 'sent', review_link: 'https://reputationflow.com/review/downtown-dental/def456', qr_code_url: null, sent_at: '2024-03-15T14:30:00Z' },
  { id: '3', business_id: '1', customer_name: 'Walk-in Customer', customer_email: null, customer_phone: null, channel: 'qr', status: 'opened', review_link: 'https://reputationflow.com/review/downtown-dental/ghi789', qr_code_url: 'data:image/png;base64,QR_PLACEHOLDER', sent_at: '2024-03-13T09:00:00Z' },
];

const EMAIL_TEMPLATES = [
  { name: 'Friendly Follow-up', subject: 'How was your experience?', body: 'Hi {name}, thank you for visiting {business}! We\'d love to hear about your experience. Your feedback helps us serve you better.' },
  { name: 'Quick Review Request', subject: 'Leave us a quick review?', body: 'Hi {name}, we hope you enjoyed your visit to {business}. Would you mind taking a moment to share your experience?' },
  { name: 'Thank You + Review', subject: 'Thank you for choosing us!', body: 'Hi {name}, thank you for choosing {business}! We value your feedback and would appreciate it if you could share your experience with others.' },
];

export default function ReviewRequestsPage() {
  const [requests] = useState<ReviewRequest[]>(DEMO_REQUESTS);
  const [showForm, setShowForm] = useState(false);
  const [channel, setChannel] = useState<'email' | 'sms' | 'qr'>('email');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  function copyLink(link: string, id: string) {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'sent': return 'bg-blue-50 text-blue-700';
      case 'opened': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }

  function getChannelIcon(ch: string) {
    switch (ch) {
      case 'email': return Mail;
      case 'sms': return Phone;
      case 'qr': return QrCode;
      default: return Send;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Review Request</h2>

          {/* Channel Selection */}
          <div className="flex gap-2 mb-4">
            {(['email', 'sms', 'qr'] as const).map((ch) => {
              const Icon = getChannelIcon(ch);
              return (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                    channel === ch ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {ch}
                </button>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input type="text" className="input-field" placeholder="John Smith" />
            </div>
            {channel === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" className="input-field" placeholder="john@example.com" />
              </div>
            )}
            {channel === 'sms' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" className="input-field" placeholder="+1 (555) 000-0000" />
              </div>
            )}
          </div>

          {/* Email Templates */}
          {channel === 'email' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
              <div className="space-y-2">
                {EMAIL_TEMPLATES.map((template, index) => (
                  <div
                    key={template.name}
                    onClick={() => setSelectedTemplate(index)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedTemplate === index ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{template.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Preview */}
          {channel === 'qr' && (
            <div className="mt-4 text-center">
              <div className="inline-block p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                <QrCode className="w-32 h-32 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">QR code will be generated</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button className="btn-primary">
              <Send className="w-4 h-4 mr-2" />
              {channel === 'qr' ? 'Generate QR Code' : 'Send Request'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Channel</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Link</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const ChannelIcon = getChannelIcon(request.channel);
                return (
                  <tr key={request.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{request.customer_name}</p>
                      <p className="text-xs text-gray-500">{request.customer_email || request.customer_phone || '-'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
                        <ChannelIcon className="w-4 h-4" />
                        {request.channel}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', getStatusColor(request.status))}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {request.sent_at ? formatDate(request.sent_at) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {request.review_link && (
                        <button
                          onClick={() => copyLink(request.review_link!, request.id)}
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
                        >
                          {copied === request.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === request.id ? 'Copied!' : 'Copy link'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
