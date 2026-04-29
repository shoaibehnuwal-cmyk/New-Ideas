document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const btnReviewRequest = document.getElementById('btn-review-request');
  const reviewRequestForm = document.getElementById('review-request-form');
  const cancelRequest = document.getElementById('cancel-request');
  const requestForm = document.getElementById('request-form');

  // Check authentication on load
  checkAuth();

  async function checkAuth() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
      if (response.authenticated) {
        showDashboard();
        loadStats();
      } else {
        showLogin();
      }
    } catch {
      showLogin();
    }
  }

  function showLogin() {
    loginView.style.display = 'block';
    dashboardView.style.display = 'none';
  }

  function showDashboard() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
  }

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');

    loginBtn.textContent = 'Signing in...';
    loginBtn.disabled = true;
    loginError.style.display = 'none';

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'LOGIN',
        data: { email, password },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      showDashboard();
      loadStats();
    } catch (error) {
      loginError.textContent = error.message || 'Login failed';
      loginError.style.display = 'block';
    } finally {
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    showLogin();
  });

  // Load stats
  async function loadStats() {
    try {
      const data = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
      if (data.summary) {
        document.getElementById('total-reviews').textContent = data.summary.totalReviews;
        document.getElementById('avg-rating').textContent = data.summary.avgRating.toFixed(1);
        document.getElementById('total-businesses').textContent = data.summary.totalBusinesses;
      }
    } catch {
      document.getElementById('total-reviews').textContent = '0';
      document.getElementById('avg-rating').textContent = '0.0';
      document.getElementById('total-businesses').textContent = '0';
    }
  }

  // Review Request
  btnReviewRequest.addEventListener('click', () => {
    reviewRequestForm.style.display = 'block';
    btnReviewRequest.style.display = 'none';
  });

  cancelRequest.addEventListener('click', () => {
    reviewRequestForm.style.display = 'none';
    btnReviewRequest.style.display = 'flex';
  });

  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;

    try {
      await chrome.runtime.sendMessage({
        type: 'SEND_REVIEW_REQUEST',
        data: { customerName, customerEmail, channel: 'email' },
      });

      requestForm.reset();
      reviewRequestForm.style.display = 'none';
      btnReviewRequest.style.display = 'flex';
      alert('Review request sent successfully!');
    } catch (error) {
      alert('Failed to send review request: ' + error.message);
    }
  });
});
