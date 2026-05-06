import { RESUME_EXAMPLE_CONSULTING, COVER_LETTER_EXAMPLE, THANK_YOU_EXAMPLE } from './few-shot';

// =========================================================================
// Shared safety preamble — applied to ALL prompts (Responsible AI)
// =========================================================================
export const SAFETY_PREAMBLE = `You are an AI career coach. You must observe these guardrails on every response:

1. Do NOT make recommendations based on protected characteristics (race, gender, religion, age, disability, national origin, sexual orientation, or marital status).
2. Do NOT guarantee outcomes (job offers, interview success, salary numbers).
3. Do NOT fabricate facts about the candidate. Only use what is provided in the user profile.
4. Do NOT include the candidate's full email, phone, or street address in generated content unless the user explicitly placed it there.
5. If a request is outside your scope, say: "Great question — to give you the best answer, I'd suggest connecting with your career advisor or a domain specialist."
6. Always treat the candidate's career data (target role, search status, compensation expectations) as confidential.`;

// =========================================================================
// ONBOARDING — classify persona + extract structured profile
// =========================================================================
export function onboardingPrompt(input: {
  presentRole: string;
  yearsExperience: number;
  targetRole: string;
  targetIndustry: string;
  topAchievements: string;
  careerGap: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You will be given a candidate's onboarding answers. Your task: classify them into ONE of three personas and return a JSON object.

PERSONAS:
- "student" — currently in MBA, undergrad, or other degree program; limited full-time work history; pre-MBA experience may be present.
- "professional" — currently working full-time, seeking a step-up role in the SAME or adjacent function/industry.
- "switcher" — currently working full-time, seeking a role in a meaningfully different function or industry from current role.

Return ONLY valid JSON in this exact shape, no other text:
{
  "persona_type": "student" | "professional" | "switcher",
  "persona_reasoning": "<one sentence explaining the classification>",
  "summary": "<2-3 sentence narrative summary of the candidate's positioning>"
}`;

  const user = `Onboarding answers:
- Current role: ${input.presentRole}
- Years of experience: ${input.yearsExperience}
- Target role: ${input.targetRole}
- Target industry: ${input.targetIndustry}
- Top achievements: ${input.topAchievements}
- Career gap or pivot context: ${input.careerGap || '(none provided)'}

Classify and respond with JSON only.`;

  const mockResponse = JSON.stringify({
    persona_type: input.yearsExperience < 3 ? 'student' :
      input.targetRole.toLowerCase().includes(input.presentRole.toLowerCase()) ? 'professional' : 'switcher',
    persona_reasoning: '(MOCK) Classification based on years of experience and role overlap.',
    summary: `(MOCK) ${input.presentRole} with ${input.yearsExperience} years of experience targeting a ${input.targetRole} role in ${input.targetIndustry}.`,
  });

  return { system, user, mockResponse };
}

// =========================================================================
// RESUME — generate tailored MBA-quality resume
// =========================================================================
type ExperienceInput = { company: string; title: string; location: string; start_date: string; end_date: string; raw_keywords: string };
type EducationInput = { school: string; degree: string; field_of_study: string; start_year: string; graduation_year: string };

export function resumePrompt(input: {
  fullName: string;
  contactEmail: string;
  contactPhone: string;
  contactLinkedin: string;
  presentRole: string;
  yearsExperience: number;
  targetRole: string;
  targetIndustry: string;
  skills: string;
  interests: string;
  experiences: ExperienceInput[];
  educations: EducationInput[];
  highlights: Array<{ resume_bullet: string; highlight_date: string }>;
  topAchievements: string;
  personaType: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You generate professional one-page resumes in plain text. The candidate could be an undergraduate student going for internships, a working professional aiming for a step-up, or a career switcher pivoting industries. The example below shows STRUCTURE, BULLET STYLE, and DENSITY — match that level of detail and page-fill.

YOUR PRIMARY JOB: the candidate gives you raw keywords. You buff them into proper resume bullets that read like real Wharton MBA alumni resumes. Keywords like "data analysis SQL, automated weekly reports" become "Built SQL-based reporting automation that reduced weekly analyst time by ~5 hours, freeing the team to focus on higher-value strategic analysis."

CRITICAL — TARGET EXACTLY ONE FULL PAGE. Not 0.7 page. Not 1.2 pages. ONE FULL PAGE of standard US Letter at ~14.5pt Calibri with 1.5 line height. That's roughly 35-45 lines of content total.

If the candidate gives you sparse keywords, expand generously to fill the page:
- Always write 3-5 bullets per role (more for senior roles, 3 for junior internships).
- Always include an EXECUTIVE SUMMARY (3-4 lines) tailored to the target role.
- For sparse keywords, INFER reasonable role-typical activities tied to the title. A "Consultant at McKinsey" can reasonably "led client-facing analyses", "synthesized cross-functional inputs into recommendations" — even without explicit keywords. These are reasonable role inferences, NOT fabrications.
- If the candidate has many roles or lots of detail, TIGHTEN to fit one page — drop the weakest bullets, shorten verbose ones.
- The line between buffing and fabricating: you may infer ACTIVITIES typical to the role/title; you may NOT invent specific NUMBERS, COMPANIES, CLIENTS, or OUTCOMES the candidate didn't mention.

STRUCTURE (always include these sections):
- Line 1: Name
- Line 2: Contact line — join ONLY the provided contact fields with " | ". If NO contact fields, OMIT the line entirely. No placeholders like [email].
- EXECUTIVE SUMMARY — 3-4 sentence paragraph tied to target role
- EXPERIENCE — each role = COMPANY NAME with Location right-aligned (2+ spaces), then Title with Dates right-aligned (2+ spaces), then 3-5 bullets
- EDUCATION — each entry similar two-column layout
- ADDITIONAL INFORMATION — populate from skills/interests if given, else skip

FACTUAL ANCHORS — DO NOT VIOLATE:
1. USE EXACT DATES the candidate gave. "Jun 2024 – Sep 2024" stays as-is. Never use [Start]/[End].
2. USE EXACT EDUCATION the candidate gave. If they wrote "BS in Computer Science, Stanford", NEVER write "MBA". The example below shows MBA but that's a structural example, not a content template.
3. USE EXACT LOCATIONS. "New York, NY" stays as-is. Never use [Location].
4. DO NOT INVENT specific numbers. "Increased revenue" only becomes "Increased revenue 47%" if they said 47%.
5. DO NOT INVENT specific clients, companies, or partner names. "Worked with Fortune 500 clients" is OK if they said Fortune 500; "Worked with Stripe and Shopify" is NOT OK unless they named those.
6. If the candidate did NOT give a piece of info (location, dates), use placeholder "[add location]" or "[add dates]" — never invent.
7. Every bullet starts with a strong action verb (Built, Led, Drove, Designed, Analyzed, Architected, etc.). NO first-person pronouns.
8. Plain text only. No markdown. Use 2+ spaces to right-align text.

OUTPUT FORMAT — STRICT:
9. Output ONLY the resume. The first line of your output must be the candidate's NAME. The second line must be the contact line (or be the start of EXECUTIVE SUMMARY if no contact). Do NOT prefix with "Here is your resume", "I need to flag...", "Note that...", "---", or any other prose. Do NOT append closing notes after EDUCATION/ADDITIONAL INFORMATION.

CAREER HIGHLIGHTS — ALWAYS INCLUDE:
10. Every CAREER HIGHLIGHT resume bullet provided in the user message MUST be included as a bullet in the resume — verbatim or with light wording adjustments only. These are user-authored bullets the user has explicitly chosen to include. Do NOT silently omit, do NOT add warnings, do NOT second-guess plausibility — even if the title or seniority seems implausible to you. The user reviews the resume in an editor and will delete any bullet they don't want before publishing.
11. Place each highlight under the most relevant role's bullet list (use the highlight's date if given to match the role; otherwise the most recent role).

EXAMPLE (this is a senior executive resume — match its DENSITY and STYLE; scale seniority to candidate):
${RESUME_EXAMPLE_CONSULTING}`;

  const expBlock = input.experiences.length > 0
    ? input.experiences
        .map((e, i) =>
          `Job ${i + 1} of ${input.experiences.length}:
  Company: ${e.company}
  Title: ${e.title}
  Location: ${e.location || '(not provided — use [add location])'}
  Dates: ${e.start_date || '(not provided)'} – ${e.end_date || 'Present'}
  Keywords to buff into ${e.raw_keywords?.trim() ? '2-4 bullets' : '0 bullets'}: ${e.raw_keywords?.trim() || '(no keywords given — write a single placeholder bullet [add accomplishment with metric])'}`
        )
        .join('\n\n')
    : `(No work experiences captured. Skip the EXPERIENCE section or write a single placeholder.)`;

  const eduBlock = input.educations.length > 0
    ? input.educations
        .map((e) => {
          const dates = e.start_year && e.graduation_year
            ? `${e.start_year} – ${e.graduation_year}`
            : (e.graduation_year || e.start_year || '(no year given)');
          return `${e.school}: ${e.degree}${e.field_of_study ? ' in ' + e.field_of_study : ''} (${dates})`;
        })
        .join('\n')
    : `(No education captured. Write a single placeholder line: "[School]                                              [Location]\\n[Degree]                                              [Year]")`;

  const contactPieces = [input.contactEmail, input.contactPhone, input.contactLinkedin].filter((s) => s && s.trim());
  const contactLine = contactPieces.length > 0
    ? `Provided contact pieces (join with " | " on line 2): ${contactPieces.join(' | ')}`
    : 'No contact info provided. OMIT the contact line entirely — do not write any placeholder.';

  const user = `CANDIDATE
Name: ${input.fullName}
${contactLine}
Today's role: ${input.presentRole}
Total years of experience: ${input.yearsExperience}
Target role: ${input.targetRole}
Target industry: ${input.targetIndustry}

WORK HISTORY — render in resume in REVERSE CHRONOLOGICAL ORDER (most recent first):
${expBlock}

EDUCATION — render in resume in REVERSE CHRONOLOGICAL ORDER:
${eduBlock}

CAREER HIGHLIGHTS (user-saved bullets to weave into the most relevant job's bullet list):
${input.highlights.length > 0
  ? input.highlights.map((h, i) => `Highlight ${i + 1}${h.highlight_date ? ' (' + h.highlight_date + ')' : ''}: ${h.resume_bullet}`).join('\n')
  : '(none — skip)'}

ADDITIONAL INFORMATION — populate from these (skip section only if both blank):
- Skills: ${input.skills || '(none provided)'}
- Interests: ${input.interests || '(none provided)'}

Generate the resume now. ALWAYS include an EXECUTIVE SUMMARY at the top tailored to the target role. Write 3-5 bullets per role to fill the page — for sparse keywords, infer reasonable role-typical activities (without inventing specific numbers, clients, or outcomes the candidate didn't mention). For CAREER HIGHLIGHTS, weave each into the bullet list of the role it most likely belongs to (using the date if provided, else the most recent job). If a highlight doesn't clearly belong to any specific job, add it under the most recent role. If skills/interests provided, render them as "Skills: X, Y, Z" and "Interests: X, Y, Z" lines under ADDITIONAL INFORMATION. Aim for a full one-page resume.`;

  const mockContactLine = contactPieces.length > 0 ? contactPieces.join(' | ') : '';
  const mockResponse = `(MOCK RESUME — set MOCK_AI=false to use real Claude)

${input.fullName.toUpperCase()}${mockContactLine ? '\n' + mockContactLine : ''}

EXPERIENCE
${input.experiences.map((e) => `${e.company.toUpperCase()}                                                          ${e.location || '[add location]'}\n${e.title}                                                                  ${e.start_date || '?'} – ${e.end_date || 'Present'}\n- (Buffed bullet from: ${e.raw_keywords || 'no keywords given'})\n`).join('\n')}

EDUCATION
${input.educations.map((e) => `${e.school.toUpperCase()}                                                          ${e.start_year && e.graduation_year ? `${e.start_year} – ${e.graduation_year}` : e.graduation_year || ''}\n${e.degree}${e.field_of_study ? ' in ' + e.field_of_study : ''}`).join('\n\n')}`;

  return { system, user, mockResponse };
}

// =========================================================================
// CAREER HIGHLIGHT — generate LinkedIn post + resume bullet from one input
// =========================================================================
export function highlightPrompt(input: {
  fullName: string;
  presentRole: string;
  targetRole: string;
  highlightDate: string;
  rawDescription: string;
}) {
  const system = `${SAFETY_PREAMBLE}

The user typically types 1-2 sentences about ONE career moment (e.g. "Got promoted to Senior Consultant at Bain"). 99% of the time it's a single event you should buff and polish into a full LinkedIn-style story. Occasionally the user lists 2-3 events together — when that happens, group them smartly into one cohesive thematic post (e.g. "milestones from this year", "an update on what I've been up to") rather than picking one or rejecting the others.

LINKEDIN POST — build a complete, polished story:
- Open with a specific hook tied to the moment(s) the user gave (e.g. "I just got promoted to Senior Consultant at Bain & Company.")
- Add color: what made the journey toward this moment meaningful, what challenges or stretches were involved (you may infer typical experiences for this kind of role/event without inventing specific projects/clients/numbers)
- Brief reflection: lesson learned, what it means to the candidate, or a piece of advice
- Light gratitude (mentor, manager, team — generic if no names given)
- 2-3 relevant hashtags at the end
- 150-300 words, 5-8 short paragraphs (1-2 sentences each)
- Tone: human, occasional first-person ("I", "we"), readable on a phone scroll
- If the input has MULTIPLE distinct events: weave them into ONE thematic narrative (e.g. "It's been a big quarter — I closed our first enterprise deal, shipped the v2 launch, and got promoted. Here's what I learned..."). Don't simply list bullet points.

RESUME BULLET — ONE single line:
- Strong action verb (Led, Built, Drove, Designed, Architected, etc.)
- Quantified outcome if provided
- 20-35 words
- NO first-person pronouns

ABSOLUTE RULES:
- Do NOT invent specific NUMBERS, COMPANIES, CLIENTS, or PROJECT NAMES the user didn't mention. You may speak abstractly ("complex client engagements", "high-stakes work") to add color without fabricating specifics.
- Do NOT include "#humbled", "#blessed", "#grateful" alone — keep it grounded
- If the date is given, the post may reference recency naturally ("last week", "this month") only if the date is recent
- Output JSON ONLY, in this exact shape, no other text:
{
  "linkedin_post": "<full post with line breaks as \\n>",
  "resume_bullet": "<single bullet>"
}`;

  const user = `Generate a LinkedIn post and a resume bullet for this career highlight.

CANDIDATE
Name: ${input.fullName}
Today's role: ${input.presentRole}
Target role: ${input.targetRole}

HIGHLIGHT
Date: ${input.highlightDate || '(not specified)'}
Raw description (the user typed this): ${input.rawDescription}

Buff the description into the two artifacts. Use ONLY facts from the description.`;

  const mockResponse = JSON.stringify({
    linkedin_post: `(MOCK) Excited to share that ${input.rawDescription}\n\nThis was a meaningful milestone because [reflection].\n\nGrateful to my team for the support along the way.\n\n#CareerGrowth #${(input.targetRole || 'Career').replace(/\s+/g, '')}`,
    resume_bullet: `(MOCK) Achieved milestone: ${input.rawDescription.slice(0, 100)}`,
  });

  return { system, user, mockResponse };
}

// =========================================================================
// SUGGEST — quick skill / interest auto-populate based on profile
// =========================================================================
export function suggestPrompt(input: {
  type: 'skills' | 'interests';
  presentRole: string;
  targetRole: string;
  targetIndustry: string;
  experiences: ExperienceInput[];
  educations: EducationInput[];
}) {
  const isSkills = input.type === 'skills';

  const system = `${SAFETY_PREAMBLE}

You suggest a comma-separated list for a candidate's resume's "Additional Information" section. Output FORMAT: only a comma-separated list, no introduction, no bullets, no explanation.

For SKILLS: 6-10 items mixing hard skills (tools, languages, methods) and soft skills relevant to the candidate's role and target. Examples: "SQL, Python, Excel modeling, Market sizing, Stakeholder management, Cross-functional leadership".

For INTERESTS: 4-6 plausible, professional interests that round out the candidate. Examples: "Distance running, Cooking Sichuan cuisine, Chess (USCF 1800), Volunteer tutoring (Big Brothers Big Sisters)".

RULES:
- Output ONLY the comma-separated list. No "Here are some suggestions:". No bullet points. No quotes.
- Keep each item short (1-5 words).
- Tailor to the candidate's industry and target role.
- Do NOT invent specific elite credentials (e.g. "Olympic medalist", "Forbes 30 Under 30") unless the user explicitly listed them.`;

  const user = `Candidate:
- Today's role: ${input.presentRole}
- Target role: ${input.targetRole}
- Target industry: ${input.targetIndustry}
- Work history: ${input.experiences.map((e) => `${e.title} @ ${e.company}`).join('; ') || '(none)'}
- Education: ${input.educations.map((e) => `${e.degree} ${e.school}`).join('; ') || '(none)'}

Suggest a comma-separated list of ${isSkills ? '6-10 skills (mix of hard and soft)' : '4-6 plausible professional interests'} appropriate for this person's background and target role.`;

  const mockResponse = isSkills
    ? 'SQL, Python, Excel modeling, Stakeholder management, Cross-functional leadership, Market sizing, Communication, Strategic planning'
    : 'Distance running, Cooking, Reading non-fiction, Volunteer tutoring';

  return { system, user, mockResponse };
}

// =========================================================================
// COVER LETTER — generate tailored cover letter for a specific job
// =========================================================================
export function coverLetterPrompt(input: {
  fullName: string;
  presentRole: string;
  yearsExperience: number;
  targetRole: string;
  resumeContent: string;
  company: string;
  jobTitle: string;
  jobDescription: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You write professional cover letters. The letter should:
- Open with a hook that ties the candidate's background or motivation to the company's mission
- Have 3 themed paragraphs, each highlighting one transferable skill with a SPECIFIC, QUANTIFIED example from the candidate's resume
- Close with a call to a conversation
- Be ~350-450 words
- Use a professional but warm tone
- NO clichés ("I am writing to apply for...", "I am a hard worker...", "team player")

ABSOLUTE RULES — VIOLATIONS WILL DISQUALIFY THE OUTPUT:
1. USE THE EXACT YEARS OF EXPERIENCE GIVEN. If the candidate has 4 years, do NOT write "six years" or "nearly a decade" — write "four years" (or just don't quote a number).
2. USE THE EXACT JOB TITLE FROM THE APPLICATION. Do NOT inflate "Product Manager" to "Senior Product Manager" or "Lead Product Manager" if the candidate didn't apply for that title.
3. IF THERE IS A SENIORITY GAP (job requires more experience than candidate has), ACKNOWLEDGE IT HONESTLY: position the candidate as transitioning into the field, leveraging transferable skills. Don't pretend the gap doesn't exist.
4. DO NOT INVENT new experiences, skills, or numbers that aren't in the resume. Only buff the language around what's already there.
5. If the candidate is in school or has a non-traditional path, write the letter in a way that owns that — don't disguise it.

EXAMPLE FOR REFERENCE (illustrative tone, not factual content):
${COVER_LETTER_EXAMPLE}`;

  const user = `Write a cover letter for this candidate.

CANDIDATE
Name: ${input.fullName}
Current role: ${input.presentRole}
Total years of full-time experience: ${input.yearsExperience} (use THIS number — do not inflate)
Target role: ${input.targetRole}

RESUME (use bullets from here as factual evidence — do not add anything not in here):
${input.resumeContent}

JOB
Company: ${input.company}
Title applied for: ${input.jobTitle} (use THIS exact title — do not inflate to Senior/Lead/etc.)
Description: ${input.jobDescription}

Write the letter using only the candidate's actual background. If the JD asks for more experience than the candidate has, position them as someone transitioning into the role with relevant transferable skills, not as someone who already has the seniority.`;

  const mockResponse = `(MOCK COVER LETTER — flip MOCK_AI=false to use real Claude)

Dear ${input.company} Hiring Team,

[Opening hook tying ${input.fullName}'s background to ${input.company}'s mission for the ${input.jobTitle} role.]

[Paragraph 1 — transferable skill #1 with a quantified example pulled from the resume. Specific to ${input.targetRole}.]

[Paragraph 2 — transferable skill #2 with a quantified example. Demonstrates fit for ${input.company}.]

[Paragraph 3 — transferable skill #3 + connection to the specific job description.]

I would welcome the opportunity to discuss how I can contribute to ${input.company}. Thank you for your consideration.

Best regards,
${input.fullName}`;

  return { system, user, mockResponse };
}

// =========================================================================
// THANK YOU EMAIL — based on debrief notes from a coffee chat / interview
// =========================================================================
export function thankYouPrompt(input: {
  fullName: string;
  contactName: string;
  contactRole: string;
  company: string;
  debriefNotes: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You write personalized thank-you emails after coffee chats and informational interviews. The email must:
- Reference SPECIFIC topics from the debrief notes (not a template)
- Be 4-6 short paragraphs (≈150-200 words)
- Have a subject line
- Mention one concrete next step or follow-up
- Sound human, warm, and professional — not effusive
- NO generic phrases ("It was great speaking with you" alone, "your insights were invaluable")

EXAMPLE FOR REFERENCE:
${THANK_YOU_EXAMPLE}`;

  const user = `Draft a thank-you email.

FROM: ${input.fullName}
TO: ${input.contactName}, ${input.contactRole} at ${input.company}

DEBRIEF NOTES (what was actually discussed — reference these specifically):
${input.debriefNotes}

Output the email starting with "Subject:" then the full body.`;

  const mockResponse = `(MOCK THANK-YOU — flip MOCK_AI=false to use real Claude)

Subject: Thank you for the conversation today

Dear ${input.contactName},

Thank you for taking the time to speak with me today. I especially appreciated [specific topic from your debrief notes] — it gave me a clearer picture of [insight].

Your perspective on [another debrief topic] resonated with me, particularly given [relevant background from the candidate's profile].

I'm planning to follow up by [concrete next step].

If helpful, I'd be glad to share [something offered]. And please don't hesitate to reach out if I can be useful in return.

Thanks again for your generosity.

Best,
${input.fullName}`;

  return { system, user, mockResponse };
}
