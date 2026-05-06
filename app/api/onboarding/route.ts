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
  const experiences: Array<{ company: string; title: string; start_date: string; end_date: string; raw_keywords: string }> = body.experiences || [];
  const educations: Array<{ school: string; degree: string; field_of_study: string; graduation_year: string }> = body.educations || [];

  // Build a brief topAchievements summary from raw keywords for backward compat
  const topAchievements = experiences
    .filter((e) => e.raw_keywords?.trim())
    .map((e) => `${e.title} @ ${e.company}: ${e.raw_keywords}`)
    .join('\n');

  const { system, user: userPrompt, mockResponse } = onboardingPrompt({
    presentRole: body.presentRole,
    yearsExperience,
    targetRole: body.targetRole,
    targetIndustry: body.targetIndustry,
    topAchievements,
    careerGap: body.careerGap,
  });

  let raw: string;
  try {
    raw = await generate({ system, user: userPrompt, mockResponse, maxTokens: 512 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('Claude call failed', err);
    return NextResponse.json({ error: `AI classification failed: ${detail}` }, { status: 500 });
  }

  let classification: { persona_type?: string };
  try {
    classification = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    classification = match ? JSON.parse(match[0]) : { persona_type: 'professional' };
  }

  const personaType = ['student', 'professional', 'switcher'].includes(classification.persona_type ?? '')
    ? classification.persona_type
    : 'professional';

  // Save profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: body.fullName,
      present_role: body.presentRole,
      years_experience: yearsExperience,
      target_role: body.targetRole,
      target_industry: body.targetIndustry,
      top_achievements: topAchievements,
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

  // Replace experiences (delete + insert)
  await supabase.from('experiences').delete().eq('user_id', user.id);
  if (experiences.length > 0) {
    const expRows = experiences.map((e, i) => ({
      user_id: user.id,
      company: e.company,
      title: e.title,
      start_date: e.start_date,
      end_date: e.end_date,
      raw_keywords: e.raw_keywords,
      position_order: i,
    }));
    const { error: expErr } = await supabase.from('experiences').insert(expRows);
    if (expErr) console.error('experiences insert failed', expErr);
  }

  // Replace education
  await supabase.from('education').delete().eq('user_id', user.id);
  if (educations.length > 0) {
    const eduRows = educations.map((e, i) => ({
      user_id: user.id,
      school: e.school,
      degree: e.degree,
      field_of_study: e.field_of_study,
      graduation_year: e.graduation_year,
      position_order: i,
    }));
    const { error: eduErr } = await supabase.from('education').insert(eduRows);
    if (eduErr) console.error('education insert failed', eduErr);
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
