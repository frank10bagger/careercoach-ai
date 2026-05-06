# CareerTwin — User Guide

**Tagline:** the digital twin for your career management

**Live URL:** https://careercoach-ai-phi.vercel.app

CareerTwin brings your fragmented career information — resumes, achievements, goals, applications, coffee chats, interview feedback, networking notes, LinkedIn presence, and milestones — into one living memory layer. Instead of manually remembering what happened, rewriting the same story, or updating every career asset yourself, CareerTwin captures the important moments and turns them into reusable profile intelligence.

Built for undergraduate students, working professionals, and career switchers.

---

## How to sign up

1. Open https://careercoach-ai-phi.vercel.app
2. Click **Get started**
3. Enter your full name, email, and a password (6+ characters)
4. You're instantly logged in — no email verification needed

To return later: click **Log in** and use the same email + password.

---

## What the app does

Five pages, four AI features, one persistent profile:

| Feature | What you give | What you get | Saved as |
|---|---|---|---|
| **Onboarding** | 9-step Q&A: name, contact info, role, work history (multi-job), education, target role/industry | A persona classification (Student / Professional / Career Switcher) and a saved profile | `profiles` + `experiences` + `education` tables |
| **Resume** | Click "Generate" — uses your stored profile | A one-page resume styled after the Wharton alumni-resume bank, with **Publish → Download PDF** | `resumes` table (versioned) |
| **Cover letter** | Company name, job title, full job description | A 350–450 word cover letter referencing both the JD and your resume | `applications` table |
| **Thank-you email** | Contact name, role, company, debrief notes | A personalized thank-you email referencing the actual topics you discussed | `coffee_chats` table |

---

## How the data flow works

```
You fill onboarding once  →  Profile saved permanently in Supabase
                                ↓
You click "Generate Resume"  →  Claude reads your profile  →  Resume saved
                                ↓
You paste a job description  →  Claude reads your profile + resume  →  Cover letter saved
                                ↓
You log a coffee chat        →  Claude reads your profile + notes   →  Thank-you saved
```

**You never re-enter your background.** Every feature reuses your stored profile.

---

## Privacy & data isolation

- Each user's data is **strictly isolated** at the database level (Postgres Row Level Security). User B literally cannot query User A's rows.
- Sensitive content (resumes, applications, coffee chat notes) is yours alone.
- Every AI call is logged in `ai_audit_log` with a timestamp, the feature, and a 500-character summary — for governance and audit, not advertising.

---

## Responsible AI guardrails

Every Claude call includes a safety preamble that:
- Forbids recommendations based on protected characteristics
- Forbids guaranteeing job offers, interview success, or salary numbers
- Forbids fabricating facts about you — only uses what's in your profile
- Forbids including your full email/phone in generated content unless you put it there
- Routes out-of-scope questions to a human ("connect with your career advisor")

---

## Tech stack

- **Frontend + backend:** Next.js 16 (App Router) on Vercel
- **Database + auth:** Supabase (Postgres + Row Level Security + email/password auth)
- **AI:** Anthropic Claude Sonnet 4.5 via the official SDK, with few-shot examples baked into prompts (sourced from Wharton MBA Career Services alumni resume bank)
- **Audit log:** every AI call written to `ai_audit_log` table for governance

---

## Built by

OIDD 6670 — AI, Business & Society — Group 6 — The Wharton School — May 2026
