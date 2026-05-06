import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generate } from '@/lib/ai/anthropic';
import { resumePrompt } from '@/lib/ai/prompts';
import { logAiCall } from '@/lib/ai/audit';

// Defensive: if Claude prepended any explanatory prose ("I need to flag...", "Note:", "---"),
// drop everything before the first plausible name line (a short line, mostly letters,
// not starting with common preamble phrases).
function stripPreamble(content: string): string {
  const lines = content.split('\n');
  const PREAMBLE_HINTS = [
    /^i (need|cannot|will not|won't)\b/i,
    /^note[:\s]/i,
    /^here is\b/i,
    /^---+$/,
    /^before generating/i,
    /^the (career|resume|highlight) /i,
  ];
  const isPreamble = (line: string) => PREAMBLE_HINTS.some((re) => re.test(line.trim()));
  const looksLikeName = (line: string) => {
    const t = line.trim();
    if (!t || t.length > 60) return false;
    // 1-5 words, mostly letters, not ending with period (sentences)
    if (t.endsWith('.') || t.endsWith(':')) return false;
    const words = t.split(/\s+/);
    if (words.length < 1 || words.length > 5) return false;
    return /^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(t);
  };

  // If first non-empty line is preamble OR doesn't look like a name, scan ahead.
  let startIdx = 0;
  while (startIdx < lines.length && lines[startIdx].trim() === '') startIdx++;
  if (startIdx < lines.length && (isPreamble(lines[startIdx]) || !looksLikeName(lines[startIdx]))) {
    // Find first name-like line
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (looksLikeName(lines[i])) {
        return lines.slice(i).join('\n').trim();
      }
    }
  }
  return content.trim();
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const [profileRes, expRes, eduRes, hlRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('experiences').select('*').eq('user_id', user.id).order('position_order'),
    supabase.from('education').select('*').eq('user_id', user.id).order('position_order'),
    supabase.from('career_highlights').select('raw_description, resume_bullet, highlight_date').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  const profile = profileRes.data;
  const rawHighlights = (hlRes.data ?? [])
    .filter((h) => h.resume_bullet)
    .map((h) => ({
      raw_description: h.raw_description || '',
      resume_bullet: h.resume_bullet || '',
      highlight_date: h.highlight_date || '',
    }));
  const baseExperiences = (expRes.data ?? []).map((e) => ({
    company: e.company || '',
    title: e.title || '',
    location: e.location || '',
    start_date: e.start_date || '',
    end_date: e.end_date || '',
    raw_keywords: e.raw_keywords || '',
  }));

  // Merge highlights into the matching experience.
  // - If a highlight mentions a company name, append its bullet to that role's keywords.
  // - If it's a promotion ("Promoted to X at Y"), update that role's title to show progression.
  // - Highlights with no company match become "standalone" entries appended to the most recent role.
  const PROMOTION_RE = /\b(?:promoted to|got promoted to|elevated to|made|stepped up to|advanced to)\s+([A-Z][^.,\n]{2,80}?)(?:\s+(?:at|@|in|with)\s+([^.,\n]+))?[.!]?\s*$/i;

  // Skip-words that aren't distinctive enough to match on
  const SKIP_WORDS = new Set(['the', 'and', '&', 'company', 'inc', 'corp', 'llc', 'ltd', 'co', 'group', 'holdings', 'a']);

  function findMatchingExperience(text: string): typeof baseExperiences[number] | null {
    const lower = text.toLowerCase();
    let best: typeof baseExperiences[number] | null = null;
    let bestScore = 0;
    for (const e of baseExperiences) {
      const c = (e.company || '').trim().toLowerCase();
      if (!c) continue;

      // Try whole-name match first
      if (c.length >= 3 && lower.includes(c)) {
        if (c.length > bestScore) {
          best = e;
          bestScore = c.length;
        }
        continue;
      }

      // Distinctive-word match: split, drop stop-words, check if any appears in the text
      const words: string[] = c.split(/[\s&,.\-]+/).filter((w: string) => w.length >= 3 && !SKIP_WORDS.has(w));
      let score = 0;
      for (const w of words) {
        if (lower.includes(w)) score += w.length;
      }
      if (score > bestScore) {
        best = e;
        bestScore = score;
      }
    }
    return best;
  }

  const standaloneHighlights: string[] = [];
  const experiences = baseExperiences.map((e) => ({ ...e })); // mutable copy

  for (const h of rawHighlights) {
    const matched = findMatchingExperience(h.raw_description);
    if (matched) {
      const idx = experiences.indexOf(experiences.find((x) => x === matched)!);
      const target = idx >= 0 ? experiences[idx] : null;
      if (target) {
        // Append resume_bullet text as an additional keyword line so the prompt naturally includes it
        target.raw_keywords = [target.raw_keywords, h.resume_bullet].filter(Boolean).join('\n');

        // If it's a promotion, update title to show progression
        const promoMatch = h.raw_description.match(PROMOTION_RE);
        if (promoMatch) {
          const newTitle = promoMatch[1].trim();
          const promotedDate = h.highlight_date || 'recent';
          const oldTitle = target.title || 'role';
          if (!target.title.toLowerCase().includes(newTitle.toLowerCase())) {
            target.title = `${oldTitle} (${target.start_date || '?'} – ${promotedDate}), ${newTitle} (${promotedDate} – ${target.end_date || 'Present'})`;
          }
        }
      }
    } else {
      standaloneHighlights.push(h.resume_bullet);
    }
  }

  // Standalone highlights → tack on to most recent role's keywords
  if (standaloneHighlights.length > 0 && experiences.length > 0) {
    experiences[0].raw_keywords = [experiences[0].raw_keywords, ...standaloneHighlights].filter(Boolean).join('\n');
  }
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
    skills: profile.skills_text || '',
    interests: profile.interests || '',
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

  // Defensive strip: if Claude prepended any explanatory prose (e.g. "I need to flag..." or "---"),
  // find the actual start of the resume (the candidate's name on its own line).
  content = stripPreamble(content);

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
