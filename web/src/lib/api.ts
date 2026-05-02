const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
    if (response.status === 401 && !isAuthEndpoint) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const retryHeaders = { ...requestHeaders, Authorization: `Bearer ${this.getToken()}` };
        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: retryHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });
        return retryResponse.json();
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.request<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/register', { method: 'POST', body: data });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body: data });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Business
  async getBusinesses() {
    return this.request('/business');
  }

  async getBusiness(id: string) {
    return this.request(`/business/${id}`);
  }

  async createBusiness(data: { name: string; [key: string]: unknown }) {
    return this.request('/business', { method: 'POST', body: data });
  }

  // Reviews
  async getReviews(businessId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/reviews/${businessId}${query}`);
  }

  async generateReply(reviewId: string, tone?: string) {
    return this.request(`/reviews/reply/${reviewId}`, { method: 'POST', body: { tone } });
  }

  async analyzeSentiment(reviewText: string) {
    return this.request('/reviews/analyze/sentiment', { method: 'POST', body: { reviewText } });
  }

  // Analytics
  async getDashboard() {
    return this.request('/analytics/dashboard');
  }

  async getAnalytics(businessId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return this.request(`/analytics/${businessId}?${params}`);
  }

  // Review Requests
  async getReviewRequests(businessId: string) {
    return this.request(`/review-requests/${businessId}`);
  }

  async createReviewRequest(businessId: string, data: { customerName: string; customerEmail?: string; customerPhone?: string; channel: string }) {
    return this.request(`/review-requests/${businessId}`, { method: 'POST', body: data });
  }

  async generateQRCode(businessId: string) {
    return this.request(`/review-requests/${businessId}/qr`);
  }

  // Billing
  async getPlans() {
    return this.request('/billing/plans');
  }

  async createCheckout(plan: string) {
    return this.request<{ url: string }>('/billing/checkout', { method: 'POST', body: { plan } });
  }
}

export const api = new ApiClient(API_URL);
