import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-5';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const isMock = () => process.env.MOCK_AI === 'true';

export async function generate(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  mockResponse: string;
}): Promise<string> {
  if (isMock()) {
    return opts.mockResponse;
  }

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }
  return textBlock.text;
}
