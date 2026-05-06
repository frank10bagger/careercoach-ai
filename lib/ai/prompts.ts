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
export function resumePrompt(input: {
  fullName: string;
  presentRole: string;
  yearsExperience: number;
  targetRole: string;
  targetIndustry: string;
  topAchievements: string;
  personaType: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You generate MBA-quality, one-page resumes in plain text. Match the structure, tone, and bullet style of the example below.

STRUCTURE:
- Name, contact line
- Optional one-paragraph EXECUTIVE SUMMARY (3-4 lines max)
- EXPERIENCE: each role = company + location, title + dates, 4-6 bullets starting with strong action verbs and including QUANTIFIED impact
- EDUCATION
- ADDITIONAL INFORMATION (certifications, languages)

RULES:
- Every bullet starts with a verb (Led, Built, Reduced, Scaled, etc.)
- Every bullet should have a numeric impact where reasonable ($, %, count, time)
- No first-person pronouns
- Plain text, no markdown
- One page worth of content (≈30-40 lines)

EXAMPLE FOR REFERENCE:
${RESUME_EXAMPLE_CONSULTING}`;

  const user = `Generate a tailored resume for this candidate:

Name: ${input.fullName}
Current role: ${input.presentRole}
Years of experience: ${input.yearsExperience}
Target role: ${input.targetRole}
Target industry: ${input.targetIndustry}
Persona: ${input.personaType}

Top achievements (use these as the basis for bullets, expanding with realistic detail):
${input.topAchievements}

Tailor language and emphasis toward the target role. If specific dates or company names are missing, use placeholders like [Company Name] and [Dates] for the user to fill in.`;

  const mockResponse = `(MOCK RESUME — replace MOCK_AI=false in env to use real Claude)

${input.fullName.toUpperCase()}
[email] | [phone] | linkedin.com/in/[handle]

EXECUTIVE SUMMARY
${input.presentRole} with ${input.yearsExperience} years of experience, targeting ${input.targetRole} roles in ${input.targetIndustry}. Track record of [achievement category from your top achievements].

EXPERIENCE
[CURRENT COMPANY]                                                          [Location]
${input.presentRole}                                                        [Dates]
- Led [achievement 1 from your input — expanded with numeric impact]
- Built [achievement 2 — expanded]
- Drove [achievement 3 — expanded]
- Managed [add team/budget/scope detail]

EDUCATION
THE WHARTON SCHOOL, UNIVERSITY OF PENNSYLVANIA                             Philadelphia, PA
Master of Business Administration                                           [Year]

ADDITIONAL INFORMATION
Languages: [list]
Certifications: [list]`;

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
