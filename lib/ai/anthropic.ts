import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const isMock = () => process.env.MOCK_AI === 'true';

// Retry on transient errors (529 overloaded, 503 unavailable, 429 rate limit)
const TRANSIENT_STATUSES = new Set([429, 503, 529]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generate(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  mockResponse: string;
}): Promise<string> {
  if (isMock()) {
    return opts.mockResponse;
  }

  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: opts.maxTokens ?? 2048,
        temperature: opts.temperature ?? 1.0,
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      });

      const textBlock = message.content.find((b) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude');
      }
      return textBlock.text;
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const isTransient = status && TRANSIENT_STATUSES.has(status);
      if (!isTransient || attempt === maxAttempts) {
        throw err;
      }
      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * 2 ** (attempt - 1);
      console.warn(`Claude transient error ${status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
      await sleep(delay);
    }
  }

  throw lastError;
}
