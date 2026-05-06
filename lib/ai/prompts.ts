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
type ExperienceInput = { company: string; title: string; start_date: string; end_date: string; raw_keywords: string };
type EducationInput = { school: string; degree: string; field_of_study: string; graduation_year: string };

export function resumePrompt(input: {
  fullName: string;
  presentRole: string;
  yearsExperience: number;
  targetRole: string;
  targetIndustry: string;
  experiences: ExperienceInput[];
  educations: EducationInput[];
  topAchievements: string;
  personaType: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You generate MBA-quality, one-page resumes in plain text. Match the structure, tone, and bullet style of the example below.

YOUR PRIMARY JOB: the candidate gives you raw keywords and numbers. You buff them up into properly worded, action-verb-led, quantified bullets that read like real Wharton MBA alumni resumes. Keywords like "$42M cost savings, 8-person team, fintech client" should become "Led 8-person team on cost optimization engagement for $1.5B fintech client; identified and implemented $42M in annual savings within 6 months."

STRUCTURE:
- Name, contact line (use placeholders if no email/phone given)
- Optional one-paragraph EXECUTIVE SUMMARY (3-4 lines, only if useful)
- EXPERIENCE: each role = COMPANY NAME + Location, Title + Dates (right-aligned via spaces), 3-5 bullets per role
- EDUCATION
- ADDITIONAL INFORMATION (only if relevant)

RULES:
- Every bullet starts with a verb (Led, Built, Reduced, Scaled, Drove, Architected, etc.)
- Every bullet should have NUMERIC impact where the input gives any numbers ($, %, count, time)
- DO NOT fabricate numbers the candidate didn't provide. If they gave "increased revenue", buff to "Drove revenue growth" — not "Drove 47% revenue growth" unless they said 47%.
- No first-person pronouns
- Plain text only, no markdown asterisks or hashes
- One page worth of content (≈30-40 lines)
- Use 2+ spaces to align dates/locations to the right (the example shows the pattern)

EXAMPLE FOR REFERENCE:
${RESUME_EXAMPLE_CONSULTING}`;

  const expBlock = input.experiences.length > 0
    ? input.experiences
        .map((e, i) =>
          `Job ${i + 1}:
  Company: ${e.company}
  Title: ${e.title}
  Dates: ${e.start_date || '?'} – ${e.end_date || 'present'}
  Keywords (buff these into ${e.raw_keywords ? '3-5' : '0'} bullets): ${e.raw_keywords || '(no detail given — skip bullets for this role or use [add detail])'}`
        )
        .join('\n\n')
    : `(No experiences captured. Use the candidate's current role "${input.presentRole}" and the topAchievements field below as the source of bullets.)\n\nTop achievements: ${input.topAchievements || '(none)'}`;

  const eduBlock = input.educations.length > 0
    ? input.educations
        .map((e) => `${e.degree}${e.field_of_study ? ' in ' + e.field_of_study : ''}, ${e.school}${e.graduation_year ? ' · ' + e.graduation_year : ''}`)
        .join('\n')
    : '(No education captured — use a single Wharton MBA placeholder line.)';

  const user = `Generate a tailored resume for this candidate:

CANDIDATE
Name: ${input.fullName}
Current role: ${input.presentRole}
Years of experience: ${input.yearsExperience}
Target role: ${input.targetRole}
Target industry: ${input.targetIndustry}
Persona: ${input.personaType}

WORK HISTORY (oldest to most recent — but render most-recent first in the resume):
${expBlock}

EDUCATION:
${eduBlock}

Tailor language and emphasis toward the target role. Use the keywords I gave you to write proper bullets — do not just echo my keywords as-is. Where I gave numbers, preserve them; do not invent numbers I didn't provide.`;

  const mockResponse = `(MOCK RESUME — set MOCK_AI=false to use real Claude)

${input.fullName.toUpperCase()}
[email] | [phone] | linkedin.com/in/[handle]

EXPERIENCE
${input.experiences.map((e) => `${e.company.toUpperCase()}                                                          [Location]\n${e.title}                                                                  ${e.start_date || ''} – ${e.end_date || 'Present'}\n- (Buffed bullet from: ${e.raw_keywords || 'no keywords given'})\n`).join('\n')}

EDUCATION
${input.educations.map((e) => `${e.school.toUpperCase()}                                                          ${e.graduation_year || ''}\n${e.degree}${e.field_of_study ? ' in ' + e.field_of_study : ''}`).join('\n\n')}`;

  return { system, user, mockResponse };
}

// =========================================================================
// COVER LETTER — generate tailored cover letter for a specific job
// =========================================================================
export function coverLetterPrompt(input: {
  fullName: string;
  presentRole: string;
  targetRole: string;
  resumeContent: string;
  company: string;
  jobTitle: string;
  jobDescription: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You write MBA-quality cover letters. The letter should:
- Open with a hook that ties the candidate's background or motivation to the company's mission
- Have 3 themed paragraphs, each highlighting one transferable skill with a SPECIFIC, QUANTIFIED example from the candidate's resume
- Close with a call to a conversation
- Be ~350-450 words
- Use a professional but warm tone
- NO clichés ("I am writing to apply for...", "I am a hard worker...", "team player")

EXAMPLE FOR REFERENCE:
${COVER_LETTER_EXAMPLE}`;

  const user = `Write a cover letter for this candidate.

CANDIDATE
Name: ${input.fullName}
Current role: ${input.presentRole}
Target role: ${input.targetRole}

RESUME (use bullets from here as evidence):
${input.resumeContent}

JOB
Company: ${input.company}
Title: ${input.jobTitle}
Description: ${input.jobDescription}

Write the letter. Use specific, quantified examples drawn from the resume. Tailor opening hook to the company.`;

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
