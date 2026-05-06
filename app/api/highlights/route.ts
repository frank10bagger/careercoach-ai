import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generate } from '@/lib/ai/anthropic';
import { highlightPrompt } from '@/lib/ai/prompts';
import { logAiCall } from '@/lib/ai/audit';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { highlightDate, rawDescription } = await req.json();
  if (!rawDescription?.trim()) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, present_role, target_role')
    .eq('id', user.id)
    .single();

  const { system, user: userPrompt, mockResponse } = highlightPrompt({
    fullName: profile?.full_name || 'Candidate',
    presentRole: profile?.present_role || '',
    targetRole: profile?.target_role || '',
    highlightDate: highlightDate || '',
    rawDescription,
  });

  let raw: string;
  try {
    raw = await generate({ system, user: userPrompt, mockResponse, maxTokens: 1200 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('Highlight generation failed', err);
    return NextResponse.json({ error: `AI generation failed: ${detail}` }, { status: 500 });
  }

  let parsed: { linkedin_post?: string; resume_bullet?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : {};
  }

  const linkedinPost = parsed.linkedin_post || raw;
  const resumeBullet = parsed.resume_bullet || `Buffed bullet for: ${rawDescription.slice(0, 80)}`;

  const { data: inserted, error: insertError } = await supabase
    .from('career_highlights')
    .insert({
      user_id: user.id,
      highlight_date: highlightDate || null,
      raw_description: rawDescription,
      linkedin_post: linkedinPost,
      resume_bullet: resumeBullet,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('highlight insert failed', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await logAiCall({
    userId: user.id,
    feature: 'career_highlight',
    promptSummary: `Highlight: ${rawDescription.slice(0, 100)}`,
    outputSummary: linkedinPost.slice(0, 200),
    wasMocked: process.env.MOCK_AI === 'true',
  });

  return NextResponse.json({
    success: true,
    id: inserted?.id,
    linkedin_post: linkedinPost,
    resume_bullet: resumeBullet,
  });
}
