import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generate } from '@/lib/ai/anthropic';
import { thankYouPrompt } from '@/lib/ai/prompts';
import { logAiCall } from '@/lib/ai/audit';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { contactName, contactRole, company, debriefNotes } = await req.json();
  if (!contactName?.trim() || !debriefNotes?.trim()) {
    return NextResponse.json({ error: 'Contact name and debrief notes are required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, onboarding_complete')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_complete) {
    return NextResponse.json({ error: 'Complete onboarding first' }, { status: 400 });
  }

  const { system, user: userPrompt, mockResponse } = thankYouPrompt({
    fullName: profile.full_name || 'Candidate',
    contactName,
    contactRole: contactRole || '',
    company: company || '',
    debriefNotes,
  });

  let content: string;
  try {
    content = await generate({ system, user: userPrompt, mockResponse, maxTokens: 800 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('Thank-you generation failed', err);
    return NextResponse.json({ error: `AI generation failed: ${detail}` }, { status: 500 });
  }

  const { error: insertError } = await supabase.from('coffee_chats').insert({
    user_id: user.id,
    contact_name: contactName,
    contact_role: contactRole,
    company,
    debrief_notes: debriefNotes,
    thank_you_email: content,
  });

  if (insertError) {
    console.error('coffee_chat insert failed', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await logAiCall({
    userId: user.id,
    feature: 'thank_you',
    promptSummary: `Thank-you for ${contactName}${company ? ' @ ' + company : ''}`,
    outputSummary: content.slice(0, 200),
    wasMocked: process.env.MOCK_AI === 'true',
  });

  return NextResponse.json({ success: true, content });
}
