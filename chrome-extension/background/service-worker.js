const API_BASE_URL = 'http://localhost:4000/api';

// Store auth token
let authToken = null;

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('ReputationFlow extension installed');
  chrome.storage.local.get(['authToken'], (result) => {
    if (result.authToken) {
      authToken = result.authToken;
    }
  });
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message }));
  return true; // Keep message channel open for async response
});

async function handleMessage(message) {
  switch (message.type) {
    case 'LOGIN':
      return handleLogin(message.data);
    case 'GET_STATS':
      return fetchStats();
    case 'GENERATE_REPLY':
      return generateReply(message.data);
    case 'SEND_REVIEW_REQUEST':
      return sendReviewRequest(message.data);
    case 'CHECK_AUTH':
      return checkAuth();
    case 'LOGOUT':
      return handleLogout();
    default:
      throw new Error('Unknown message type');
  }
}

async function handleLogin({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  authToken = data.accessToken;
  await chrome.storage.local.set({
    authToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  });

  return { success: true, user: data.user };
}

async function handleLogout() {
  authToken = null;
  await chrome.storage.local.remove(['authToken', 'refreshToken', 'user']);
  return { success: true };
}

async function checkAuth() {
  const result = await chrome.storage.local.get(['authToken', 'user']);
  if (result.authToken) {
    authToken = result.authToken;
    return { authenticated: true, user: result.user };
  }
  return { authenticated: false };
}

async function fetchStats() {
  if (!authToken) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

async function generateReply({ reviewId, reviewText, rating, businessName, tone }) {
  if (!authToken) throw new Error('Not authenticated');

  if (reviewId) {
    const response = await fetch(`${API_BASE_URL}/reviews/reply/${reviewId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ tone }),
    });

    if (!response.ok) throw new Error('Failed to generate reply');
    return response.json();
  }

  // Fallback: generate reply locally for reviews not in our system
  return {
    generatedReply: generateLocalReply(reviewText, rating, businessName, tone),
  };
}

function generateLocalReply(reviewText, rating, businessName, tone = 'professional') {
  const isPositive = rating >= 4;
  const templates = {
    professional: isPositive
      ? `Thank you for your wonderful review! We at ${businessName || 'our business'} are delighted to hear about your positive experience. We look forward to serving you again.`
      : `Thank you for your feedback. We at ${businessName || 'our business'} take all concerns seriously and would like the opportunity to address your experience. Please reach out to us directly.`,
    friendly: isPositive
      ? `Thanks so much for the kind words! We're thrilled you had a great time. See you again soon!`
      : `We're sorry to hear about your experience. We'd love a chance to make things right — please contact us!`,
  };

  return templates[tone] || templates.professional;
}

async function sendReviewRequest(data) {
  if (!authToken) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/review-requests/${data.businessId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to send review request');
  return response.json();
}
