import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generate } from '@/lib/ai/anthropic';
import { coverLetterPrompt } from '@/lib/ai/prompts';
import { logAiCall } from '@/lib/ai/audit';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { company, jobTitle, jobDescription } = await req.json();
  if (!company || !jobTitle || !jobDescription) {
    return NextResponse.json({ error: 'Company, job title, and description are required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: latestResume } = await supabase
    .from('resumes')
    .select('content_text')
    .eq('user_id', user.id)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (!profile?.onboarding_complete) {
    return NextResponse.json({ error: 'Complete onboarding first' }, { status: 400 });
  }
  if (!latestResume) {
    return NextResponse.json({ error: 'Generate a resume first' }, { status: 400 });
  }

  const { system, user: userPrompt, mockResponse } = coverLetterPrompt({
    fullName: profile.full_name || 'Candidate',
    presentRole: profile.present_role || '',
    targetRole: profile.target_role || '',
    resumeContent: latestResume.content_text,
    company,
    jobTitle,
    jobDescription,
  });

  let content: string;
  try {
    content = await generate({ system, user: userPrompt, mockResponse, maxTokens: 1500 });
  } catch (err) {
    console.error('Cover letter generation failed', err);
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 });
  }

  const { error: insertError, data: inserted } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      company,
      job_title: jobTitle,
      job_description: jobDescription,
      cover_letter: content,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('application insert failed', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await logAiCall({
    userId: user.id,
    feature: 'cover_letter',
    promptSummary: `Cover letter for ${jobTitle} @ ${company}`,
    outputSummary: content.slice(0, 200),
    wasMocked: process.env.MOCK_AI === 'true',
  });

  return NextResponse.json({ success: true, content, applicationId: inserted?.id });
}
