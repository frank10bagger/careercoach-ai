import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generate } from '@/lib/ai/anthropic';
import { onboardingPrompt } from '@/lib/ai/prompts';
import { logAiCall } from '@/lib/ai/audit';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const yearsExperience = parseInt(body.yearsExperience, 10) || 0;

  const { system, user: userPrompt, mockResponse } = onboardingPrompt({
    presentRole: body.presentRole,
    yearsExperience,
    targetRole: body.targetRole,
    targetIndustry: body.targetIndustry,
    topAchievements: body.topAchievements,
    careerGap: body.careerGap,
  });

  let raw: string;
  try {
    raw = await generate({ system, user: userPrompt, mockResponse, maxTokens: 512 });
  } catch (err) {
    console.error('Claude call failed', err);
    return NextResponse.json({ error: 'AI classification failed. Please try again.' }, { status: 500 });
  }

  let classification: { persona_type?: string; persona_reasoning?: string; summary?: string };
  try {
    classification = JSON.parse(raw);
  } catch {
    // Best-effort fallback if Claude wrapped JSON in extra text
    const match = raw.match(/\{[\s\S]*\}/);
    classification = match ? JSON.parse(match[0]) : { persona_type: 'professional' };
  }

  const personaType = ['student', 'professional', 'switcher'].includes(classification.persona_type ?? '')
    ? classification.persona_type
    : 'professional';

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: body.fullName,
      present_role: body.presentRole,
      years_experience: yearsExperience,
      target_role: body.targetRole,
      target_industry: body.targetIndustry,
      top_achievements: body.topAchievements,
      career_gap: body.careerGap,
      persona_type: personaType,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('profile update failed', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await logAiCall({
    userId: user.id,
    feature: 'onboarding',
    promptSummary: `Classify persona for ${body.presentRole} -> ${body.targetRole}`,
    outputSummary: `Persona: ${personaType}`,
    wasMocked: process.env.MOCK_AI === 'true',
  });

  return NextResponse.json({ success: true, persona_type: personaType });
}
