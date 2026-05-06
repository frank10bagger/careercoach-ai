# CareerTwin — Group 6 Presentation

**Format:** 8 min talk + 4 min Q&A · End of class · OIDD 6670 Session 3 · 2026-05-07

**Live URL:** https://careercoach-ai-phi.vercel.app
**GitHub:** https://github.com/frank10bagger/careercoach-ai

---

## Slide 1 — User Guide (REQUIRED FIRST SLIDE)

### CareerTwin — the digital twin for your career management

> Your fragmented career information becomes one living memory layer. You enter your background once. Every AI feature reuses it.

**Live URL:** https://careercoach-ai-phi.vercel.app

**How to sign up (15 seconds):**
1. Click "Get started"
2. Enter name, email, password
3. You're in — no email verification needed

**5 surfaces. One persistent profile.**

| Feature | Input | Output |
|---|---|---|
| Onboarding | 8-step conversational Q&A | Persona + saved profile (powers everything below) |
| Resume | Click Generate | One-page MBA-style resume → Publish → Download PDF |
| Cover letter | JD + company | 350-450 word personalized letter |
| Thank-you email | Coffee-chat debrief notes | Email referencing actual topics discussed |
| Career highlights | One sentence about a milestone | LinkedIn post + resume bullet (auto-flows to resume) |

**Built with:** Next.js 16 · Supabase (Postgres + RLS) · Anthropic Claude Sonnet 4.6 · Vercel · jsPDF

---

## Slide 2 — The Problem (1 min)

**Most undergrads have no access to real career mentorship.**

- Career services are stretched thin: 1 advisor per ~500 students
- Generic templates produce generic resumes that don't match the job
- Existing AI tools are stateless — you re-explain yourself every session
- Career switchers and non-traditional applicants get the least support

**Result:** under-prepared applications, missed offers, lost opportunities

**Our user:** undergraduate students hunting internships and first full-time roles

**Success metric:** user completes a full mentorship cycle — onboarding → persona mapped → resume → cover letter → thank-you — and returns for a second application without re-entering their profile

---

## Slide 3 — The Product (1 min)

A persistent AI career mentor with **memory**.

**Conversational onboarding (9 questions, one at a time):**
- Name → contact info (optional) → present role → years experience → work history (multi-job, with edit) → education → target role → target industry → review

**Auto-generated, tailored content:**
- Resume drafted from your stored profile (using few-shot examples from Wharton MBA Career Services alumni resume bank)
- Cover letters that reference both the job description AND your resume
- Thank-you emails that mention specific topics from your debrief notes

**You never re-enter your profile.** Sign in 6 months later → it's all there.

---

## Slide 4 — Live Demo (4 min — CRITICAL)

### Sequence the presenter runs:

1. **(30s) Sign up live** — fresh account, professor-visible
2. **(60s) Onboarding** — show 9-step Q&A; key in keywords + numbers, NOT polished bullets
3. **(60s) Resume** — click Generate → show how raw keywords were buffed into proper bullets → click Publish → Download PDF live
4. **(45s) Cover letter** — paste any real job description → show the AI references both the JD and the stored resume
5. **(30s) Thank-you** — quick debrief notes → show personalized email
6. **(15s) Isolation** — log out, sign up second account in incognito → empty dashboard. Prove user data isolation.

**Talking points while demoing:**
- "Notice the AI is buffing my raw keywords, not just echoing them"
- "I'm clicking Edit on a saved job — full edit-in-place"
- "PDF downloads directly, no print dialog needed"
- "Notice this second account can't see anything from the first one"

---

## Slide 5 — Technical Architecture (45 sec)

```
Browser → Vercel (Next.js 16 SSR) → Supabase (Postgres + Auth + RLS)
                                  → Anthropic Claude Sonnet 4.6
```

**Database (8 tables, all row-level-security'd):**
profiles · experiences · education · resumes · applications · coffee_chats · interview_preps · ai_audit_log

**AI engineering:**
- Few-shot examples from Wharton MBA Career Services in every prompt
- 8-stage agent reasoning chain (per HQ template): Understanding → Goals → Fit → Positioning → Assets → Plan → Guardrails → Output
- Auto-retry on Anthropic 429/503/529 (exponential backoff)
- Temperature 0.1 for factual classification, 1.0 for creative bullet writing

---

## Slide 6 — Responsible AI (1 min — REQUIRED 5 PTS)

Every Claude call ships with a **safety preamble** that:

1. **No protected characteristics** — race, gender, religion, age, disability, etc. cannot drive recommendations
2. **No outcome guarantees** — never promises offers, interviews, salary
3. **No fabrication** — only uses what's in the user's profile; missing fields become `[add location]` placeholders, never invented data
4. **No PII leakage** — won't include full email/phone unless user explicitly added it
5. **Human-in-the-loop** — won't send emails directly; clipboard / Outlook copy only
6. **Out-of-scope routing** — questions outside the agent's scope route to "connect with your career advisor"

**Audit trail:** every AI call logged in `ai_audit_log` table — feature, prompt summary, output summary, mocked-or-not flag, timestamp.

**Data isolation:** RLS policies on every table mean User B literally cannot query User A's rows at the database level.

---

## Slide 7 — Build Reflection (2 min — REQUIRED 5 PTS)

### What worked
1. **Stage-prompted build** — auth → DB → one feature at a time → polish. We always had something working.
2. **Few-shot examples in every prompt** — pulled from Wharton's real alumni resume bank. Output quality jumped immediately.
3. **Mock mode during dev (`MOCK_AI=true`)** — let us iterate UI without burning Anthropic credits.

### What didn't work (first time around)
1. **`current_role` as a Postgres column** — reserved keyword. Migration failed.
2. **Print-to-PDF for the resume** — Chrome's print dialog leaked the dashboard sidebar into the PDF. Ugly.
3. **Single-form onboarding** — felt cold and clinical. Users skimmed past the whole thing.

### What we tried that AMAZED us
- **Server-side merging of career highlights into experiences** — instead of asking Claude to weave them in, we mutate the experience object server-side (title progression, keyword append). Claude then generates a resume from one unified profile. The promotion auto-updates everything: title line, exec summary, target-role positioning. **No prompt-engineering gymnastics — just better data structure.**
- **Conversational onboarding with a chat-style AI avatar** — same data the form would collect, but felt like talking to a person. Confetti + cheer text on each Next click made it actually *fun* to fill out a 9-step form.

### How many iterations to be happy
- **Resume output**: ~12 prompt iterations. The breakthrough was treating the few-shot example as STRUCTURE (not content) and adding hard "DO NOT FABRICATE" rules.
- **PDF generation**: 4 iterations. v1 was `window.print()` (bad). v2 added html2canvas + jsPDF. v3 fixed Tailwind 4 oklch incompatibility with inline hex. v4 forced one-page fit by stretching to 8.5×11.
- **Career highlight prompt**: 5 iterations to land the right balance of "buff up" vs. "don't fabricate" + "one event in, full story out".

### 3 things AI got right · 2 things we fixed manually
- AI: Supabase auth + RLS scaffolding compiled first try
- AI: Generated all 5 prompt templates with safety guardrails baked in
- AI: Built the conversational onboarding state machine in one shot
- 🛠️ Manual: fixed model name (`claude-sonnet-4-5` → `claude-sonnet-4-6`)
- 🛠️ Manual: rewrote resume preview with inline hex colors to satisfy html2canvas

---

## Slide 8 — Version 2 (45 sec)

If we had 2 more weeks:

1. **Outlook OAuth integration** — send thank-you emails directly without copy-paste
2. **Interview prep** — STAR-method coaching with mock interview voice mode
3. **Networking contact tracker** — log alumni outreach, track follow-ups, draft outreach messages
4. **Story Bank** — behavioral interview stories with quality scores
5. **Job posting auto-fetch** — paste a URL instead of pasting the description
6. **Resume scoring against ATS** — flag missing keywords from the JD

---

## Slide 9 — Q&A

Likely questions:

> "Why not just use ChatGPT?"
ChatGPT is stateless — every session starts fresh. We persist your profile and reuse it across resume, cover letter, and thank-you flows. The AI sees your full background every time.

> "How accurate is the resume?"
We don't fabricate. The AI buffs your keywords into proper bullets but won't invent dates, companies, or numbers you didn't provide. Missing fields become `[add location]` placeholders.

> "What about privacy?"
Postgres RLS isolates data per user at the database level. Every AI call is audit-logged. No data leaves Supabase or Anthropic.

> "Why Anthropic Claude over OpenAI?"
Claude Sonnet 4.6 follows multi-line system prompts with instruction priority more reliably in our testing. The safety guardrails preamble works better.
