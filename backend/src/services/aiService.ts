import OpenAI from 'openai';
import { env } from '../config/env';

const openai = new OpenAI({ apiKey: env.openaiApiKey });

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  summary: string;
}

export interface ReplyResult {
  reply: string;
  tone: string;
}

export const AIService = {
  async analyzeSentiment(reviewText: string, rating?: number): Promise<SentimentResult> {
    if (!env.openaiApiKey) {
      return inferSentimentFromText(reviewText, rating);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a sentiment analysis expert. Analyze the following review and respond with a JSON object containing:
- "sentiment": one of "positive", "neutral", or "negative"
- "score": a number between 0 and 1 (0 = most negative, 1 = most positive)
- "summary": a brief one-sentence summary of the review's key points

Respond ONLY with the JSON object, no additional text.`,
          },
          { role: 'user', content: reviewText },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content || '';
      return JSON.parse(content) as SentimentResult;
    } catch {
      return inferSentimentFromText(reviewText, rating);
    }
  },

  async generateReply(
    reviewText: string,
    rating: number,
    businessName: string,
    tone: string = 'professional'
  ): Promise<ReplyResult> {
    if (!env.openaiApiKey) {
      return generateFallbackReply(reviewText, rating, businessName, tone);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a reputation management assistant for "${businessName}". Generate a ${tone} reply to the following customer review.

Guidelines:
- Be genuine and authentic
- Thank the customer for their feedback
- Address specific points they mentioned
- If negative, acknowledge concerns and offer to make it right
- Keep it concise (2-4 sentences)
- Never be defensive or dismissive
- Do NOT offer discounts or compensation in the reply
- Be ethical - no fake promises or misleading claims`,
          },
          {
            role: 'user',
            content: `Rating: ${rating}/5\nReview: ${reviewText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return {
        reply: response.choices[0]?.message?.content || '',
        tone,
      };
    } catch {
      return generateFallbackReply(reviewText, rating, businessName, tone);
    }
  },

  async generateBusinessInsights(reviews: Array<{ review_text: string; rating: number; sentiment: string }>): Promise<string> {
    if (!env.openaiApiKey) {
      return 'AI insights require an OpenAI API key. Please configure your API key in settings.';
    }

    try {
      const reviewSummary = reviews
        .slice(0, 20)
        .map((r) => `Rating: ${r.rating}/5, Sentiment: ${r.sentiment}, Text: ${r.review_text}`)
        .join('\n');

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze these customer reviews and provide actionable business insights. Include:
1. Top strengths (what customers love)
2. Areas for improvement
3. Common themes
4. Recommended actions
Keep it concise and practical.`,
          },
          { role: 'user', content: reviewSummary },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || '';
    } catch {
      return 'Unable to generate insights at this time.';
    }
  },
};

function inferSentimentFromText(text: string, rating?: number): SentimentResult {
  // Use rating as primary signal when available
  if (rating !== undefined) {
    if (rating <= 2) {
      return { sentiment: 'negative', score: rating / 5, summary: 'Low rating indicates negative experience.' };
    } else if (rating >= 4) {
      return { sentiment: 'positive', score: rating / 5, summary: 'High rating indicates positive experience.' };
    }
  }

  const lowerText = text.toLowerCase();
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect', 'outstanding'];
  const negativeWords = ['terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'hate', 'disgusting', 'disappointing', 'avoid', 'cold', 'slow', 'rude'];
  const negationPatterns = ['not recommend', 'would not', 'do not', 'don\'t', 'wouldn\'t', 'never'];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++;
  }
  if (lowerText.includes('recommend')) {
    const isNegated = negationPatterns.some(p => lowerText.includes(p));
    if (isNegated) negativeCount++;
    else positiveCount++;
  }
  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', score: 0.8, summary: 'Generally positive feedback.' };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'negative', score: 0.2, summary: 'Generally negative feedback.' };
  }
  return { sentiment: 'neutral', score: 0.5, summary: 'Mixed or neutral feedback.' };
}

function generateFallbackReply(
  _reviewText: string,
  rating: number,
  businessName: string,
  tone: string
): ReplyResult {
  const templates: Record<string, Record<string, string>> = {
    positive: {
      professional: `Thank you for your wonderful review! We at ${businessName} are delighted to hear about your positive experience. We look forward to serving you again.`,
      friendly: `Thanks so much for the kind words! We're thrilled you had a great time at ${businessName}. See you again soon!`,
      empathetic: `Your kind words truly mean the world to us at ${businessName}. Thank you for taking the time to share your experience.`,
      formal: `We sincerely appreciate your positive feedback regarding ${businessName}. Your satisfaction is our highest priority.`,
    },
    negative: {
      professional: `Thank you for your feedback. We at ${businessName} take all concerns seriously and would like the opportunity to address your experience. Please reach out to us directly.`,
      friendly: `We're sorry to hear about your experience. That's not what we aim for at ${businessName}. We'd love a chance to make things right — please contact us!`,
      empathetic: `We're truly sorry to hear this. Your feedback helps us improve at ${businessName}. We'd appreciate the chance to make this right for you.`,
      formal: `We acknowledge your concerns regarding your experience at ${businessName}. We take your feedback seriously and would appreciate the opportunity to address these matters directly.`,
    },
  };

  const category = rating >= 4 ? 'positive' : 'negative';
  const toneKey = tone in (templates[category] || {}) ? tone : 'professional';

  return {
    reply: templates[category]?.[toneKey] || templates[category]?.professional || '',
    tone: toneKey,
  };
}
