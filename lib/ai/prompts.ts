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
  experiences: ExperienceInput[];
  educations: EducationInput[];
  topAchievements: string;
  personaType: string;
}) {
  const system = `${SAFETY_PREAMBLE}

You generate professional one-page resumes in plain text. The candidate could be an undergraduate student going for internships, a working professional aiming for a step-up, or a career switcher pivoting industries. The example below shows the STRUCTURE and BULLET STYLE — copy that style, but scale seniority to whatever the candidate provides. A college sophomore who interned at a startup gets shorter, more modest bullets than a 10-year executive.

YOUR PRIMARY JOB: the candidate gives you raw keywords and numbers. You buff them up into properly worded, action-verb-led, quantified bullets. Keywords like "data analysis SQL, automated weekly reports saved 5 hours/week, 3 stakeholder presentations" should become "Built SQL-based reporting automation that reduced weekly analyst time by 5 hours; presented findings to 3 senior stakeholders driving operational decisions."

STRUCTURE:
- Name (line 1)
- Contact line (line 2): join ONLY the provided contact fields with " | ". If NO contact fields are provided, OMIT the contact line entirely (skip line 2). Do NOT use placeholders like [email] or [phone]. Real values only or nothing.
- EXPERIENCE: each role = COMPANY NAME on one line with location right-aligned via 2+ spaces, then Title on next line with dates right-aligned via 2+ spaces, then 2-4 bullets
- EDUCATION
- (Optional) ADDITIONAL INFORMATION — only if relevant info given

ABSOLUTE RULES — VIOLATIONS WILL RUIN THE OUTPUT:
1. USE THE EXACT DATES THE CANDIDATE GIVES. If they gave "Jun 2024 – Sep 2024", write "Jun 2024 – Sep 2024" — NOT "[Start] – [End]" placeholders.
2. USE THE EXACT EDUCATION THE CANDIDATE GIVES. If they wrote "BS in Computer Science, Stanford, 2024", do NOT replace it with MBA or any other degree. The example below shows MBA but that does NOT mean every resume should be MBA.
3. DO NOT FABRICATE numbers the candidate didn't provide. "Increased revenue" must NOT become "Increased revenue 47%" unless they said 47%.
4. USE THE EXACT LOCATIONS the candidate gives for each job. If they gave "New York, NY", write "New York, NY" — NOT "[Location]".
5. If the candidate did NOT give a piece of info (location, dates, keywords), use the placeholder "[add location]" or "[add dates]" — do NOT invent.
6. Every bullet starts with a strong action verb (Built, Led, Drove, Designed, Analyzed, etc.). NO first-person pronouns.
7. Plain text only. No markdown. No asterisks for bold. No hashes for headers. Use 2+ spaces to right-align text.
8. Output ONLY the resume — no explanation, no "Here is your resume", no closing notes.

EXAMPLE (note: this is a senior executive resume — for an undergrad student or junior professional, scale bullets DOWN to appropriate length and seniority):
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

Generate the resume now. Use ONLY the data above. Do not invent companies, dates, locations, schools, or degrees. EXECUTIVE SUMMARY is optional — include it only for senior candidates with significant experience.`;

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
