import { NextResponse } from 'next/server';
import { generate } from '@/lib/ai/anthropic';
import { suggestPrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const type = body.type === 'interests' ? 'interests' : 'skills';

  const { system, user: userPrompt, mockResponse } = suggestPrompt({
    type,
    presentRole: body.presentRole || '',
    targetRole: body.targetRole || '',
    targetIndustry: body.targetIndustry || '',
    experiences: body.experiences || [],
    educations: body.educations || [],
  });

  let raw: string;
  try {
    raw = await generate({ system, user: userPrompt, mockResponse, maxTokens: 200, temperature: 0.7 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('Suggest call failed', err);
    return NextResponse.json({ error: `Suggestion failed: ${detail}` }, { status: 500 });
  }

  // Clean output: take first line that looks like a comma-separated list
  const cleaned = raw
    .split('\n')
    .map((s) => s.trim())
    .find((s) => s.includes(',')) || raw.trim();

  return NextResponse.json({ suggestions: cleaned });
}
