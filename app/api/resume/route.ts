import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generate } from '@/lib/ai/anthropic';
import { resumePrompt } from '@/lib/ai/prompts';
import { logAiCall } from '@/lib/ai/audit';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const [profileRes, expRes, eduRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('experiences').select('*').eq('user_id', user.id).order('position_order'),
    supabase.from('education').select('*').eq('user_id', user.id).order('position_order'),
  ]);

  const profile = profileRes.data;
  const experiences = (expRes.data ?? []).map((e) => ({
    company: e.company || '',
    title: e.title || '',
    location: e.location || '',
    start_date: e.start_date || '',
    end_date: e.end_date || '',
    raw_keywords: e.raw_keywords || '',
  }));
  const educations = (eduRes.data ?? []).map((e) => ({
    school: e.school || '',
    degree: e.degree || '',
    field_of_study: e.field_of_study || '',
    start_year: e.start_year || '',
    graduation_year: e.graduation_year || '',
  }));

  if (!profile?.onboarding_complete) {
    return NextResponse.json({ error: 'Complete onboarding before generating a resume' }, { status: 400 });
  }

  const { system, user: userPrompt, mockResponse } = resumePrompt({
    fullName: profile.full_name || 'Candidate Name',
    contactEmail: profile.contact_email || '',
    contactPhone: profile.contact_phone || '',
    contactLinkedin: profile.contact_linkedin || '',
    presentRole: profile.present_role || '',
    yearsExperience: profile.years_experience || 0,
    targetRole: profile.target_role || '',
    targetIndustry: profile.target_industry || '',
    experiences,
    educations,
    topAchievements: profile.top_achievements || '',
    personaType: profile.persona_type || 'professional',
  });

  let content: string;
  try {
    content = await generate({ system, user: userPrompt, mockResponse, maxTokens: 2048 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('Resume generation failed', err);
    return NextResponse.json({ error: `AI generation failed: ${detail}` }, { status: 500 });
  }

  // Save as new version
  const { data: existing } = await supabase
    .from('resumes')
    .select('version')
    .eq('user_id', user.id)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = (existing?.[0]?.version ?? 0) + 1;

  const { error: insertError } = await supabase.from('resumes').insert({
    user_id: user.id,
    content_text: content,
    target_role: profile.target_role,
    version: nextVersion,
  });

  if (insertError) {
    console.error('resume insert failed', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await logAiCall({
    userId: user.id,
    feature: 'resume',
    promptSummary: `Generate resume v${nextVersion} for ${profile.target_role}`,
    outputSummary: content.slice(0, 200),
    wasMocked: process.env.MOCK_AI === 'true',
  });

  return NextResponse.json({ success: true, content, version: nextVersion });
}

// PUT: save user-edited content as a new version
export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { content } = await req.json();
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('target_role')
    .eq('id', user.id)
    .single();

  const { data: existing } = await supabase
    .from('resumes')
    .select('version')
    .eq('user_id', user.id)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = (existing?.[0]?.version ?? 0) + 1;

  const { error } = await supabase.from('resumes').insert({
    user_id: user.id,
    content_text: content,
    target_role: profile?.target_role,
    version: nextVersion,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, version: nextVersion });
}
