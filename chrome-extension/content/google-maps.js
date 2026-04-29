// ReputationFlow - Google Maps Content Script
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
    // Google Maps review containers
    const reviewElements = document.querySelectorAll('[data-review-id], .jftiEf');

    reviewElements.forEach((reviewEl) => {
      if (reviewEl.querySelector(`.${BUTTON_CLASS}`)) return;

      const reviewText = extractReviewText(reviewEl);
      const rating = extractRating(reviewEl);
      const reviewerName = extractReviewerName(reviewEl);

      if (!reviewText && !rating) return;

      const buttonContainer = createAIReplyButton(reviewText, rating, reviewerName);
      const actionsArea = reviewEl.querySelector('.review-actions, .k7Oqjb') || reviewEl;
      actionsArea.appendChild(buttonContainer);
    });
  }

  function extractReviewText(reviewEl) {
    const textEl = reviewEl.querySelector('.wiI7pd, .review-full-text, [class*="review-text"]');
    return textEl ? textEl.textContent.trim() : '';
  }

  function extractRating(reviewEl) {
    const starEl = reviewEl.querySelector('[aria-label*="star"], [aria-label*="Star"]');
    if (starEl) {
      const match = starEl.getAttribute('aria-label').match(/(\d)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    return 0;
  }

  function extractReviewerName(reviewEl) {
    const nameEl = reviewEl.querySelector('.d4r55, [class*="reviewer"], .reviewer-name');
    return nameEl ? nameEl.textContent.trim() : 'Customer';
  }

  function createAIReplyButton(reviewText, rating, reviewerName) {
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

        if (response.error) {
          throw new Error(response.error);
        }

        showReplyBox(container, response.generatedReply, reviewText, rating, reviewerName);
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

  function showReplyBox(container, replyText, reviewText, rating, reviewerName) {
    const existingBox = container.querySelector('.rf-reply-box');
    if (existingBox) existingBox.remove();

    const replyBox = document.createElement('div');
    replyBox.className = 'rf-reply-box';
    replyBox.innerHTML = `
      <div class="rf-reply-header">
        <span class="rf-reply-label">AI-Generated Reply for ${reviewerName}</span>
      </div>
      <textarea class="rf-reply-text">${replyText}</textarea>
      <div class="rf-reply-actions">
        <button class="rf-btn rf-btn-copy">Copy</button>
        <button class="rf-btn rf-btn-regenerate">Regenerate</button>
        <button class="rf-btn rf-btn-close">Close</button>
      </div>
    `;

    const copyBtn = replyBox.querySelector('.rf-btn-copy');
    copyBtn.addEventListener('click', () => {
      const textarea = replyBox.querySelector('.rf-reply-text');
      navigator.clipboard.writeText(textarea.value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });

    replyBox.querySelector('.rf-btn-regenerate').addEventListener('click', async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GENERATE_REPLY',
          data: { reviewText, rating, businessName: getBusinessName(), tone: 'friendly' },
        });
        replyBox.querySelector('.rf-reply-text').value = response.generatedReply;
      } catch (error) {
        alert('Failed to regenerate: ' + error.message);
      }
    });

    replyBox.querySelector('.rf-btn-close').addEventListener('click', () => {
      replyBox.remove();
    });

    container.appendChild(replyBox);
  }

  function getBusinessName() {
    const titleEl = document.querySelector('h1.DUwDvf, [data-attrid="title"], .section-hero-header-title span');
    return titleEl ? titleEl.textContent.trim() : 'Your Business';
  }

  // Initialize when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
