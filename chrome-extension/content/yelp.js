// ReputationFlow - Yelp Content Script
(function () {
  'use strict';

  const BUTTON_CLASS = 'rf-ai-reply-btn';
  let observer = null;

  function init() {
    injectButtons();
    observeDOM();
  }

  function observeDOM() {
    observer = new MutationObserver(() => {
      injectButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function injectButtons() {
    const reviewElements = document.querySelectorAll('[class*="review__"], li[class*="margin"]');

    reviewElements.forEach((reviewEl) => {
      if (reviewEl.querySelector(`.${BUTTON_CLASS}`)) return;

      const reviewText = extractReviewText(reviewEl);
      const rating = extractRating(reviewEl);

      if (!reviewText) return;

      const buttonContainer = createAIReplyButton(reviewText, rating);
      reviewEl.appendChild(buttonContainer);
    });
  }

  function extractReviewText(reviewEl) {
    const textEl = reviewEl.querySelector('[class*="comment"], p[class*="text"], .review-content p');
    return textEl ? textEl.textContent.trim() : '';
  }

  function extractRating(reviewEl) {
    const starEl = reviewEl.querySelector('[aria-label*="star rating"]');
    if (starEl) {
      const match = starEl.getAttribute('aria-label').match(/(\d)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    return 0;
  }

  function createAIReplyButton(reviewText, rating) {
    const container = document.createElement('div');
    container.className = `${BUTTON_CLASS} rf-button-container`;

    const button = document.createElement('button');
    button.className = 'rf-btn';
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 4L14.5 9.5L20 10.5L16 14.5L17 20L12 17L7 20L8 14.5L4 10.5L9.5 9.5L12 4Z"/>
      </svg>
      Reply with AI
    `;

    button.addEventListener('click', async () => {
      button.disabled = true;
      button.innerHTML = 'Generating...';

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GENERATE_REPLY',
          data: { reviewText, rating, businessName: getBusinessName(), tone: 'professional' },
        });

        if (response.error) throw new Error(response.error);

        showReplyBox(container, response.generatedReply);
      } catch (error) {
        alert('Failed to generate reply: ' + error.message);
      } finally {
        button.disabled = false;
        button.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 4L14.5 9.5L20 10.5L16 14.5L17 20L12 17L7 20L8 14.5L4 10.5L9.5 9.5L12 4Z"/>
          </svg>
          Reply with AI
        `;
      }
    });

    container.appendChild(button);
    return container;
  }

  function showReplyBox(container, replyText) {
    const existingBox = container.querySelector('.rf-reply-box');
    if (existingBox) existingBox.remove();

    const replyBox = document.createElement('div');
    replyBox.className = 'rf-reply-box';
    replyBox.innerHTML = `
      <textarea class="rf-reply-text">${replyText}</textarea>
      <div class="rf-reply-actions">
        <button class="rf-btn rf-btn-copy">Copy</button>
        <button class="rf-btn rf-btn-close">Close</button>
      </div>
    `;

    replyBox.querySelector('.rf-btn-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(replyBox.querySelector('.rf-reply-text').value);
    });

    replyBox.querySelector('.rf-btn-close').addEventListener('click', () => {
      replyBox.remove();
    });

    container.appendChild(replyBox);
  }

  function getBusinessName() {
    const titleEl = document.querySelector('h1[class*="heading"], h1');
    return titleEl ? titleEl.textContent.trim() : 'Your Business';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
