// Generates CareerTwin-Presentation.pptx from PRESENTATION.md
// Run: node build-pptx.js
//
// Theme: emerald brand. Each slide uses a distinct layout to avoid monotony.

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" × 7.5" — gives more breathing room
pres.author = "Group 6 — OIDD 6670";
pres.title = "CareerTwin";

// Color palette ("Emerald Brand")
const C = {
  emerald: "10B981",
  emeraldDark: "047857",
  emeraldDeep: "064E3B",
  slate900: "0F172A",
  slate700: "334155",
  slate500: "64748B",
  slate400: "94A3B8",
  slate200: "E2E8F0",
  slate100: "F1F5F9",
  slate50: "F8FAFC",
  white: "FFFFFF",
  amber: "F59E0B",
  sky: "0EA5E9",
  violet: "8B5CF6",
};

// Fonts
const FONT = "Calibri";

// Layout dims
const W = 13.333;
const H = 7.5;

// ==========================================================================
// Utilities
// ==========================================================================
function brandMark(slide, x = 0.5, y = 0.4) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 0.45, h: 0.45,
    fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    rectRadius: 0.08,
  });
  slide.addText("CT", {
    x, y, w: 0.45, h: 0.45,
    fontFace: FONT, fontSize: 16, bold: true, color: C.white,
    align: "center", valign: "middle", margin: 0,
  });
  slide.addText("CareerTwin", {
    x: x + 0.55, y: y - 0.02, w: 2, h: 0.45,
    fontFace: FONT, fontSize: 16, bold: true, color: C.slate900,
    valign: "middle", margin: 0,
  });
}

function pageNumber(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: W - 1.2, y: H - 0.5, w: 0.8, h: 0.3,
    fontFace: FONT, fontSize: 10, color: C.slate400,
    align: "right", margin: 0,
  });
}

function footerLine(slide) {
  slide.addText("OIDD 6670 · Group 6 · The Wharton School", {
    x: 0.5, y: H - 0.5, w: 5, h: 0.3,
    fontFace: FONT, fontSize: 10, color: C.slate400, margin: 0,
  });
}

function slideTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.5, y: 1.1, w: W - 1, h: 0.7,
    fontFace: FONT, fontSize: 36, bold: true, color: C.slate900,
    margin: 0, valign: "middle",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 1.85, w: W - 1, h: 0.4,
      fontFace: FONT, fontSize: 16, color: C.emeraldDark,
      margin: 0, italic: true,
    });
  }
}

const TOTAL = 15;

// Card shadow factory — never reuse a shadow object across calls (pptxgenjs mutates in place)
const cardShadow = () => ({ type: "outer", color: "0F172A", blur: 12, offset: 3, angle: 90, opacity: 0.08 });

// ==========================================================================
// SLIDE 1 — User Guide (also functions as title slide)
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide, 0.5, 0.4);

  // Big hero
  slide.addText("CareerTwin", {
    x: 0.5, y: 1.4, w: W - 1, h: 0.9,
    fontFace: FONT, fontSize: 56, bold: true, color: C.slate900, margin: 0,
  });
  slide.addText("the digital twin for your career management", {
    x: 0.5, y: 2.35, w: W - 1, h: 0.5,
    fontFace: FONT, fontSize: 22, color: C.emerald, italic: true, margin: 0,
  });

  // Live URL pill
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 3.0, w: 5.5, h: 0.45,
    fill: { color: C.slate50 }, line: { color: C.slate200, width: 1 }, rectRadius: 0.22,
  });
  slide.addText([
    { text: "Live URL:  ", options: { color: C.slate500, fontSize: 12, bold: true } },
    { text: "https://careercoach-ai-phi.vercel.app", options: { color: C.emeraldDark, fontSize: 12, bold: true } },
  ], { x: 0.65, y: 3.0, w: 5.3, h: 0.45, fontFace: FONT, valign: "middle", margin: 0 });

  // Two-column body: How to sign up + Features table
  // Left: How to sign up
  slide.addText("How to sign up — 15 seconds", {
    x: 0.5, y: 3.7, w: 4.5, h: 0.4,
    fontFace: FONT, fontSize: 16, bold: true, color: C.slate900, margin: 0,
  });
  slide.addText([
    { text: "1.  Open the URL above", options: { color: C.slate700, breakLine: true } },
    { text: "2.  Click ", options: { color: C.slate700 } },
    { text: "Get started", options: { color: C.slate900, bold: true, breakLine: true } },
    { text: "3.  Enter name, email, password (6+)", options: { color: C.slate700, breakLine: true } },
    { text: "4.  Instantly logged in — no email check", options: { color: C.slate700 } },
  ], {
    x: 0.5, y: 4.15, w: 4.5, h: 1.6,
    fontFace: FONT, fontSize: 13, paraSpaceAfter: 4, margin: 0,
  });

  // Right: Features table
  slide.addText("5 surfaces · one persistent profile", {
    x: 5.5, y: 3.7, w: 7.3, h: 0.4,
    fontFace: FONT, fontSize: 16, bold: true, color: C.slate900, margin: 0,
  });

  const tableData = [
    [
      { text: "Feature", options: { bold: true, color: C.white, fill: { color: C.emeraldDark }, fontFace: FONT, fontSize: 11 } },
      { text: "Input", options: { bold: true, color: C.white, fill: { color: C.emeraldDark }, fontFace: FONT, fontSize: 11 } },
      { text: "Output", options: { bold: true, color: C.white, fill: { color: C.emeraldDark }, fontFace: FONT, fontSize: 11 } },
    ],
    [
      { text: "Onboarding", options: { bold: true, fontFace: FONT, fontSize: 10, color: C.slate900 } },
      { text: "8-step Q&A", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
      { text: "Persona + saved profile", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
    ],
    [
      { text: "Resume", options: { bold: true, fontFace: FONT, fontSize: 10, color: C.slate900 } },
      { text: "Click Generate", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
      { text: "1-page MBA-style → PDF", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
    ],
    [
      { text: "Cover letter", options: { bold: true, fontFace: FONT, fontSize: 10, color: C.slate900 } },
      { text: "JD + company", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
      { text: "Personalized 350-word letter", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
    ],
    [
      { text: "Thank-you", options: { bold: true, fontFace: FONT, fontSize: 10, color: C.slate900 } },
      { text: "Debrief notes", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
      { text: "Email referencing real topics", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
    ],
    [
      { text: "Highlights", options: { bold: true, fontFace: FONT, fontSize: 10, color: C.slate900 } },
      { text: "One sentence", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
      { text: "LinkedIn post + resume bullet", options: { fontFace: FONT, fontSize: 10, color: C.slate700 } },
    ],
  ];
  slide.addTable(tableData, {
    x: 5.5, y: 4.15, w: 7.3, colW: [1.5, 2.3, 3.5],
    border: { type: "solid", pt: 0.5, color: C.slate200 },
    rowH: 0.32,
  });

  // Stack note
  slide.addText("Built with: Next.js 16 · Supabase (Postgres + RLS) · Anthropic Claude Sonnet 4.6 · Vercel · jsPDF", {
    x: 0.5, y: 6.7, w: W - 1, h: 0.4,
    fontFace: FONT, fontSize: 10, color: C.slate400, italic: true, margin: 0,
  });

  footerLine(slide);
  pageNumber(slide, 1, TOTAL);
}

// ==========================================================================
// SLIDE 2 — The Problem
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "The Problem", "Most undergrads have no real career mentorship.");

  // Big stat callout (left)
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 2.6, w: 4.5, h: 3.3,
    fill: { color: C.emeraldDeep }, line: { color: C.emeraldDeep, width: 0 }, rectRadius: 0.15,
  });
  slide.addText("1 : 500", {
    x: 0.5, y: 2.9, w: 4.5, h: 1.6,
    fontFace: FONT, fontSize: 96, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
  });
  slide.addText("advisor-to-student ratio", {
    x: 0.5, y: 4.5, w: 4.5, h: 0.5,
    fontFace: FONT, fontSize: 16, color: C.emerald, align: "center", margin: 0,
  });
  slide.addText("at the typical undergrad career office.", {
    x: 0.5, y: 5.0, w: 4.5, h: 0.5,
    fontFace: FONT, fontSize: 12, italic: true, color: C.slate400, align: "center", margin: 0,
  });

  // Right: 4 pain bullets in a list
  slide.addText("What goes wrong:", {
    x: 5.5, y: 2.6, w: 7.3, h: 0.4,
    fontFace: FONT, fontSize: 18, bold: true, color: C.slate900, margin: 0,
  });
  slide.addText([
    { text: "Career services stretched thin: 1 advisor per ~500 students", options: { bullet: true, breakLine: true, color: C.slate700 } },
    { text: "Generic templates produce generic resumes that don't match the JD", options: { bullet: true, breakLine: true, color: C.slate700 } },
    { text: "Existing AI tools are stateless — re-explain yourself every session", options: { bullet: true, breakLine: true, color: C.slate700 } },
    { text: "Career switchers and non-traditional applicants get the least support", options: { bullet: true, color: C.slate700 } },
  ], { x: 5.5, y: 3.1, w: 7.3, h: 2.2, fontFace: FONT, fontSize: 14, paraSpaceAfter: 6, margin: 0 });

  slide.addText([
    { text: "Result: ", options: { bold: true, color: C.slate900 } },
    { text: "under-prepared applications, missed offers, lost opportunities.", options: { color: C.slate700 } },
  ], { x: 5.5, y: 5.45, w: 7.3, h: 0.4, fontFace: FONT, fontSize: 14, margin: 0 });

  // Success metric callout (rubric: measurable success metric)
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 6.15, w: W - 1, h: 0.85,
    fill: { color: C.emerald }, line: { color: C.emerald, width: 0 }, rectRadius: 0.1,
    shadow: cardShadow(),
  });
  slide.addText([
    { text: "SUCCESS METRIC  ", options: { bold: true, color: "A7F3D0", fontSize: 11, charSpacing: 4 } },
    { text: "User completes the full mentorship cycle ", options: { color: C.white, fontSize: 13, bold: true } },
    { text: "(onboarding → persona mapped → resume → cover letter → thank-you) ", options: { color: "D1FAE5", fontSize: 12 } },
    { text: "AND returns for a second application without re-entering their profile.", options: { color: C.white, fontSize: 13, bold: true } },
  ], { x: 0.7, y: 6.15, w: W - 1.4, h: 0.85, fontFace: FONT, valign: "middle", margin: 0 });

  pageNumber(slide, 2, TOTAL);
}

// ==========================================================================
// SLIDE 3 — The Product
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "The Product", "A persistent AI career mentor with memory.");

  // 5 feature cards in horizontal row
  const cardY = 2.7;
  const cardH = 2.5;
  const gap = 0.15;
  const cards = [
    { title: "Onboarding", body: "Conversational 8-step Q&A. Persona auto-classified.", color: C.emerald },
    { title: "Resume", body: "Generate → edit → publish 1-page PDF. Wharton-style.", color: C.sky },
    { title: "Cover letter", body: "Paste a JD. Get a 350-word letter referencing your resume.", color: C.amber },
    { title: "Thank-you", body: "Debrief notes → personalized email mentioning real topics.", color: C.violet },
    { title: "Highlights", body: "One milestone in. LinkedIn post + auto-flowing resume bullet.", color: C.emeraldDark },
  ];
  const totalW = W - 1;
  const cardW = (totalW - gap * (cards.length - 1)) / cards.length;
  cards.forEach((c, i) => {
    const x = 0.5 + i * (cardW + gap);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: cardY, w: cardW, h: cardH,
      fill: { color: C.white }, line: { color: C.slate200, width: 1 }, rectRadius: 0.1,
      shadow: cardShadow(),
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2, y: cardY + 0.2, w: 0.4, h: 0.4,
      fill: { color: c.color }, line: { color: c.color, width: 0 }, rectRadius: 0.08,
    });
    slide.addText((i + 1).toString(), {
      x: x + 0.2, y: cardY + 0.2, w: 0.4, h: 0.4,
      fontFace: FONT, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
    });
    slide.addText(c.title, {
      x: x + 0.2, y: cardY + 0.7, w: cardW - 0.4, h: 0.45,
      fontFace: FONT, fontSize: 16, bold: true, color: C.slate900, margin: 0,
    });
    slide.addText(c.body, {
      x: x + 0.2, y: cardY + 1.15, w: cardW - 0.4, h: cardH - 1.3,
      fontFace: FONT, fontSize: 11, color: C.slate700, margin: 0,
    });
  });

  // Tagline below
  slide.addText("You enter your background once. Every feature reuses it.", {
    x: 0.5, y: 5.6, w: W - 1, h: 0.5,
    fontFace: FONT, fontSize: 16, italic: true, color: C.emeraldDark, align: "center", margin: 0,
  });
  slide.addText("Sign in 6 months later → it's all there. Resume, applications, chats, milestones.", {
    x: 0.5, y: 6.1, w: W - 1, h: 0.4,
    fontFace: FONT, fontSize: 13, color: C.slate500, align: "center", margin: 0,
  });

  footerLine(slide);
  pageNumber(slide, 3, TOTAL);
}

// ==========================================================================
// SLIDE 4 — Live Demo
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Live Demo — 4 minutes", "Sign up live. Build a real profile. Ship a real PDF.");

  const steps = [
    { time: "0:00", action: "Sign up live", detail: "Fresh account in front of the class. Email + password, no verification." },
    { time: "0:30", action: "Onboarding", detail: "8 conversational steps — keywords + numbers, AI classifies persona." },
    { time: "1:30", action: "Resume", detail: "Click Generate → keywords buffed into bullets → Publish → Download PDF." },
    { time: "2:30", action: "Cover letter", detail: "Paste a real JD. Letter references both the JD and the stored resume." },
    { time: "3:15", action: "Thank-you", detail: "Debrief notes → email mentioning the actual topics from the chat." },
    { time: "3:45", action: "Isolation", detail: "Second account in incognito → empty dashboard. RLS proven." },
  ];

  const startY = 2.65;
  const rowH = 0.6;
  steps.forEach((s, i) => {
    const y = startY + i * rowH;
    // Time pill
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: y + 0.05, w: 0.85, h: rowH - 0.15,
      fill: { color: C.emerald }, line: { color: C.emerald, width: 0 }, rectRadius: 0.08,
    });
    slide.addText(s.time, {
      x: 0.5, y: y + 0.05, w: 0.85, h: rowH - 0.15,
      fontFace: FONT, fontSize: 12, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    // Action
    slide.addText(s.action, {
      x: 1.55, y: y, w: 2.5, h: rowH,
      fontFace: FONT, fontSize: 14, bold: true, color: C.slate900,
      valign: "middle", margin: 0,
    });
    // Detail
    slide.addText(s.detail, {
      x: 4.2, y: y, w: 8.6, h: rowH,
      fontFace: FONT, fontSize: 12, color: C.slate700,
      valign: "middle", margin: 0,
    });
  });

  // Talking points (italic, bottom)
  slide.addText([
    { text: "Talking points: ", options: { bold: true, color: C.slate900 } },
    { text: "\"Notice the AI is buffing my raw keywords, not just echoing them.\" · ", options: { italic: true, color: C.slate500 } },
    { text: "\"This second account can't see anything from the first one.\"", options: { italic: true, color: C.slate500 } },
  ], {
    x: 0.5, y: 6.55, w: W - 1, h: 0.5,
    fontFace: FONT, fontSize: 11, margin: 0,
  });

  footerLine(slide);
  pageNumber(slide, 4, TOTAL);
}

// ==========================================================================
// SLIDE 5 — Technical Architecture
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Technical Architecture");

  // Architecture diagram - 3 boxes connected by arrows
  const boxY = 2.7;
  const boxH = 1.4;
  const browserX = 0.5, browserW = 2.8;
  const vercelX = 4.0, vercelW = 4.0;
  const dataX = 9.0, dataW = 3.8;

  // Browser box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: browserX, y: boxY, w: browserW, h: boxH,
    fill: { color: C.slate100 }, line: { color: C.slate200, width: 1 }, rectRadius: 0.1,
  });
  slide.addText("Browser", {
    x: browserX, y: boxY + 0.15, w: browserW, h: 0.4,
    fontFace: FONT, fontSize: 14, bold: true, color: C.slate900, align: "center", margin: 0,
  });
  slide.addText("React + Tailwind\nUI state + forms", {
    x: browserX, y: boxY + 0.6, w: browserW, h: 0.7,
    fontFace: FONT, fontSize: 11, color: C.slate500, align: "center", margin: 0,
  });

  // Arrow 1
  slide.addShape(pres.shapes.LINE, {
    x: browserX + browserW + 0.05, y: boxY + boxH / 2, w: vercelX - browserX - browserW - 0.1, h: 0,
    line: { color: C.slate400, width: 1.5, endArrowType: "triangle" },
  });

  // Vercel/Next.js box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: vercelX, y: boxY, w: vercelW, h: boxH,
    fill: { color: C.emerald }, line: { color: C.emerald, width: 0 }, rectRadius: 0.1,
  });
  slide.addText("Vercel · Next.js 16 (SSR)", {
    x: vercelX, y: boxY + 0.15, w: vercelW, h: 0.4,
    fontFace: FONT, fontSize: 14, bold: true, color: C.white, align: "center", margin: 0,
  });
  slide.addText("API routes · server components · auth-aware middleware", {
    x: vercelX, y: boxY + 0.6, w: vercelW, h: 0.7,
    fontFace: FONT, fontSize: 11, color: C.white, align: "center", margin: 0,
  });

  // Arrow 2
  slide.addShape(pres.shapes.LINE, {
    x: vercelX + vercelW + 0.05, y: boxY + boxH / 2, w: dataX - vercelX - vercelW - 0.1, h: 0,
    line: { color: C.slate400, width: 1.5, endArrowType: "triangle" },
  });

  // Data box (Supabase + Anthropic stacked)
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: dataX, y: boxY, w: dataW, h: 0.62,
    fill: { color: C.slate900 }, line: { color: C.slate900, width: 0 }, rectRadius: 0.08,
  });
  slide.addText("Supabase · Postgres + RLS + Auth", {
    x: dataX, y: boxY, w: dataW, h: 0.62,
    fontFace: FONT, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
  });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: dataX, y: boxY + 0.78, w: dataW, h: 0.62,
    fill: { color: C.emeraldDeep }, line: { color: C.emeraldDeep, width: 0 }, rectRadius: 0.08,
  });
  slide.addText("Anthropic · Claude Sonnet 4.6", {
    x: dataX, y: boxY + 0.78, w: dataW, h: 0.62,
    fontFace: FONT, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
  });

  // Two columns of detail below
  slide.addText("8 RLS-protected tables", {
    x: 0.5, y: 4.5, w: 6.0, h: 0.4,
    fontFace: FONT, fontSize: 14, bold: true, color: C.slate900, margin: 0,
  });
  slide.addText("profiles · experiences · education · resumes · applications · coffee_chats · career_highlights · ai_audit_log", {
    x: 0.5, y: 4.9, w: 6.0, h: 1.5,
    fontFace: FONT, fontSize: 11, color: C.slate500, margin: 0,
  });

  slide.addText("AI engineering", {
    x: 7.0, y: 4.5, w: 5.8, h: 0.4,
    fontFace: FONT, fontSize: 14, bold: true, color: C.slate900, margin: 0,
  });
  slide.addText([
    { text: "Few-shot examples from Wharton MBA Career Services in every prompt", options: { bullet: true, breakLine: true, color: C.slate700 } },
    { text: "Auto-retry on Anthropic 429 / 503 / 529 with exponential backoff", options: { bullet: true, breakLine: true, color: C.slate700 } },
    { text: "Temp 0.1 for classification · 1.0 for creative bullet writing", options: { bullet: true, color: C.slate700 } },
  ], {
    x: 7.0, y: 4.9, w: 5.8, h: 1.8,
    fontFace: FONT, fontSize: 11, paraSpaceAfter: 4, margin: 0,
  });

  footerLine(slide);
  pageNumber(slide, 5, TOTAL);
}

// ==========================================================================
// SLIDE 6 — Polish & UX (rubric: BUILD Polish & UX, 10 pts)
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Polish & UX", "Production-feel details across every screen");

  const items = [
    {
      icon: "✦", color: C.emerald,
      title: "Empty states with guidance",
      body: "Every page that can be empty has an illustrated card that tells the user the next step (\"Generate resume to create one from your profile\")",
    },
    {
      icon: "◐", color: C.sky,
      title: "Skeleton shimmer during AI calls",
      body: "Replaces 'Loading…' text with a shimmering card + status label (\"Drafting your tailored resume…\"). Feels alive, not stuck.",
    },
    {
      icon: "▢", color: C.amber,
      title: "Conversational onboarding + confetti",
      body: "9-step Q&A with chat-bubble AI avatar. Subtle confetti + rotating cheer text on each Next click. Submitting fires a bigger burst.",
    },
    {
      icon: "↻", color: C.violet,
      title: "Auto-retry on transient errors",
      body: "Anthropic 429 / 503 / 529 → exponential backoff (1s · 2s · 4s · 4 attempts). User never sees a transient blip.",
    },
    {
      icon: "✎", color: C.emeraldDark,
      title: "Edit-in-place + clickable history",
      body: "Past jobs, education, applications, coffee chats, resume versions — all clickable. Edit a saved job → form pre-fills. View past resume read-only.",
    },
    {
      icon: "▤", color: C.slate700,
      title: "One-page PDF guarantee",
      body: "html2canvas + jsPDF capture the styled preview, then stretch-fit to exactly 8.5×11. No print dialog, no overflow, no half-page emptiness.",
    },
  ];

  const cols = 3, rows = 2;
  const gridY = 2.55;
  const gridH = 4.0;
  const gridW = W - 1;
  const cellW = (gridW - 0.3 * (cols - 1)) / cols;
  const cellH = (gridH - 0.3 * (rows - 1)) / rows;

  items.forEach((it, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.5 + col * (cellW + 0.3);
    const y = gridY + row * (cellH + 0.3);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: cellW, h: cellH,
      fill: { color: C.white }, line: { color: C.slate200, width: 1 }, rectRadius: 0.1,
      shadow: cardShadow(),
    });
    // Icon badge
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.25, y: y + 0.25, w: 0.55, h: 0.55,
      fill: { color: it.color }, line: { color: it.color, width: 0 },
    });
    slide.addText(it.icon, {
      x: x + 0.25, y: y + 0.25, w: 0.55, h: 0.55,
      fontFace: FONT, fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
    });
    slide.addText(it.title, {
      x: x + 0.95, y: y + 0.25, w: cellW - 1.15, h: 0.55,
      fontFace: FONT, fontSize: 13, bold: true, color: C.slate900, valign: "middle", margin: 0,
    });
    slide.addText(it.body, {
      x: x + 0.25, y: y + 0.95, w: cellW - 0.5, h: cellH - 1.1,
      fontFace: FONT, fontSize: 10.5, color: C.slate700, margin: 0,
    });
  });

  // Bottom accent line
  slide.addText([
    { text: "Mobile responsive · ", options: { color: C.slate700 } },
    { text: "ATS-friendly plain-text resume · ", options: { color: C.slate700 } },
    { text: "AI-generated content disclaimers ", options: { color: C.slate700 } },
    { text: "on every output surface", options: { color: C.slate700, italic: true } },
  ], {
    x: 0.5, y: 6.7, w: W - 1, h: 0.4,
    fontFace: FONT, fontSize: 11, align: "center", margin: 0,
  });

  pageNumber(slide, 6, TOTAL);
}

// ==========================================================================
// SLIDE 7 — Responsible AI
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Responsible AI · Governance", "Every Claude call ships with a safety preamble.");

  // 6 guardrails in 2x3 grid
  const guardrails = [
    { title: "No protected characteristics", body: "Race · gender · religion · age · disability cannot drive recommendations" },
    { title: "No outcome guarantees", body: "Never promises offers, interviews, or salary figures" },
    { title: "No fabrication", body: "Missing fields become [add location] placeholders, never invented data" },
    { title: "No PII leakage", body: "Won't include email or phone unless the user explicitly added it" },
    { title: "Human-in-the-loop", body: "Won't send emails directly · clipboard fallback only" },
    { title: "Out-of-scope routing", body: "Routes ambiguous questions to \"connect with your career advisor\"" },
  ];
  const cols = 3, rows = 2;
  const gridY = 2.65;
  const gridH = 3.0;
  const gridW = W - 1;
  const cellW = (gridW - 0.3 * (cols - 1)) / cols;
  const cellH = (gridH - 0.3 * (rows - 1)) / rows;

  guardrails.forEach((g, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.5 + col * (cellW + 0.3);
    const y = gridY + row * (cellH + 0.3);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: cellW, h: cellH,
      fill: { color: C.slate50 }, line: { color: C.slate200, width: 1 }, rectRadius: 0.08,
      shadow: cardShadow(),
    });
    // Number badge
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.2, w: 0.45, h: 0.45,
      fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    });
    slide.addText((i + 1).toString(), {
      x: x + 0.2, y: y + 0.2, w: 0.45, h: 0.45,
      fontFace: FONT, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
    });
    slide.addText(g.title, {
      x: x + 0.8, y: y + 0.2, w: cellW - 1, h: 0.45,
      fontFace: FONT, fontSize: 13, bold: true, color: C.slate900, valign: "middle", margin: 0,
    });
    slide.addText(g.body, {
      x: x + 0.2, y: y + 0.75, w: cellW - 0.4, h: cellH - 0.95,
      fontFace: FONT, fontSize: 11, color: C.slate700, margin: 0,
    });
  });

  // Bottom audit line
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 6.4, w: W - 1, h: 0.55,
    fill: { color: C.emeraldDeep }, line: { color: C.emeraldDeep, width: 0 }, rectRadius: 0.08,
  });
  slide.addText([
    { text: "Audit trail: ", options: { bold: true, color: C.white } },
    { text: "every AI call written to ai_audit_log table — feature · prompt summary · output summary · was_mocked · timestamp", options: { color: "D1FAE5" } },
  ], {
    x: 0.5, y: 6.4, w: W - 1, h: 0.55,
    fontFace: FONT, fontSize: 12, valign: "middle", align: "center", margin: 0,
  });

  pageNumber(slide, 7, TOTAL);
}

// ==========================================================================
// SLIDE 8 — Build Reflection
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Build Reflection", "What worked · what broke · what amazed us");

  // 4-quadrant layout
  const qY = 2.65;
  const qW = (W - 1.4) / 2;
  const qH = (H - 3.4) / 2;
  const gap = 0.4;

  function quadrant(x, y, color, header, items) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: qW, h: qH,
      fill: { color: C.white }, line: { color: C.slate200, width: 1 }, rectRadius: 0.1,
      shadow: cardShadow(),
    });
    // Top accent bar (only on the header row)
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.0, y: y + 0.0, w: 0.18, h: qH,
      fill: { color }, line: { color, width: 0 },
    });
    slide.addText(header, {
      x: x + 0.4, y: y + 0.15, w: qW - 0.5, h: 0.4,
      fontFace: FONT, fontSize: 14, bold: true, color: C.slate900, margin: 0,
    });
    slide.addText(items.map((t, i) => ({
      text: t,
      options: { bullet: true, color: C.slate700, breakLine: i < items.length - 1 },
    })), {
      x: x + 0.4, y: y + 0.6, w: qW - 0.6, h: qH - 0.7,
      fontFace: FONT, fontSize: 11, paraSpaceAfter: 3, margin: 0,
    });
  }

  quadrant(0.5, qY, C.emerald, "What worked", [
    "Stage-prompted build: auth → DB → 1 feature → polish",
    "Few-shot examples from Wharton resume bank in every prompt",
    "MOCK_AI=true mode let us iterate UI without burning credits",
  ]);
  quadrant(0.5 + qW + gap, qY, C.amber, "What broke (first try)", [
    "current_role rejected as Postgres column (reserved keyword)",
    "Print-to-PDF leaked dashboard sidebar into the file",
    "Single-form onboarding felt cold and clinical",
  ]);
  quadrant(0.5, qY + qH + gap, C.violet, "What AMAZED us", [
    "Server-side merge of highlights into experiences — no prompt gymnastics, just better data",
    "Conversational onboarding + confetti made a 9-step form fun",
  ]);
  quadrant(0.5 + qW + gap, qY + qH + gap, C.sky, "Iterations to be happy", [
    "Resume output: ~12 prompt iterations",
    "PDF generation: 4 iterations (print → html2canvas → fit-to-page)",
    "Highlight prompt: 5 iterations (single event in, full story out)",
  ]);

  pageNumber(slide, 8, TOTAL);
}

// ==========================================================================
// SLIDE 9 — Version 2
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Version 2", "If we had two more weeks…");

  const v2 = [
    { title: "Outlook OAuth", body: "Send thank-you emails directly without copy-paste" },
    { title: "Interview prep", body: "STAR-method coaching with mock interview voice mode" },
    { title: "Networking tracker", body: "Log alumni outreach, track follow-ups, draft messages" },
    { title: "Story Bank", body: "Behavioral interview stories with quality scores" },
    { title: "JD auto-fetch", body: "Paste a URL instead of pasting the job description" },
    { title: "ATS resume scoring", body: "Flag missing keywords from the JD" },
  ];

  const cols = 3, rows = 2;
  const gridY = 2.6;
  const gridH = 3.6;
  const gridW = W - 1;
  const cellW = (gridW - 0.3 * (cols - 1)) / cols;
  const cellH = (gridH - 0.3 * (rows - 1)) / rows;

  v2.forEach((v, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.5 + col * (cellW + 0.3);
    const y = gridY + row * (cellH + 0.3);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: cellW, h: cellH,
      fill: { color: C.white }, line: { color: C.slate200, width: 1 }, rectRadius: 0.1,
      shadow: cardShadow(),
    });
    // Big number
    slide.addText(`0${i + 1}`, {
      x: x + 0.25, y: y + 0.2, w: 0.9, h: 0.6,
      fontFace: FONT, fontSize: 28, bold: true, color: C.emerald, margin: 0,
    });
    slide.addText(v.title, {
      x: x + 0.25, y: y + 0.85, w: cellW - 0.5, h: 0.4,
      fontFace: FONT, fontSize: 15, bold: true, color: C.slate900, margin: 0,
    });
    slide.addText(v.body, {
      x: x + 0.25, y: y + 1.3, w: cellW - 0.5, h: cellH - 1.4,
      fontFace: FONT, fontSize: 11, color: C.slate700, margin: 0,
    });
  });

  pageNumber(slide, 9, TOTAL);
}

// ==========================================================================
// SLIDE 10 — Q&A
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.slate900 };

  // Brand mark in white
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 0.4, w: 0.45, h: 0.45,
    fill: { color: C.emerald }, line: { color: C.emerald, width: 0 }, rectRadius: 0.08,
  });
  slide.addText("CT", {
    x: 0.5, y: 0.4, w: 0.45, h: 0.45,
    fontFace: FONT, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
  });
  slide.addText("CareerTwin", {
    x: 1.05, y: 0.38, w: 2, h: 0.45,
    fontFace: FONT, fontSize: 16, bold: true, color: C.white, valign: "middle", margin: 0,
  });

  // Big Q&A
  slide.addText("Q&A", {
    x: 0.5, y: 1.4, w: W - 1, h: 1.0,
    fontFace: FONT, fontSize: 64, bold: true, color: C.white, margin: 0,
  });
  slide.addText("Live URL · github.com/frank10bagger/careercoach-ai", {
    x: 0.5, y: 2.4, w: W - 1, h: 0.5,
    fontFace: FONT, fontSize: 16, color: C.emerald, italic: true, margin: 0,
  });

  // Anticipated questions
  const qa = [
    {
      q: "Why not just use ChatGPT?",
      a: "ChatGPT is stateless — every session starts fresh. CareerTwin persists your profile and reuses it across all features.",
    },
    {
      q: "How accurate is the resume?",
      a: "We don't fabricate. AI buffs your keywords; missing fields become [add location] placeholders.",
    },
    {
      q: "What about privacy?",
      a: "Postgres RLS isolates data per user at the DB level. Every AI call audit-logged.",
    },
  ];
  const qaY = 3.4;
  qa.forEach((item, i) => {
    const y = qaY + i * 1.15;
    slide.addText("Q.", {
      x: 0.5, y: y, w: 0.5, h: 0.4,
      fontFace: FONT, fontSize: 14, bold: true, color: C.emerald, margin: 0,
    });
    slide.addText(item.q, {
      x: 1.0, y: y, w: W - 1.5, h: 0.4,
      fontFace: FONT, fontSize: 14, bold: true, color: C.white, margin: 0,
    });
    slide.addText(item.a, {
      x: 1.0, y: y + 0.4, w: W - 1.5, h: 0.6,
      fontFace: FONT, fontSize: 12, color: "CBD5E1", italic: true, margin: 0,
    });
  });

  slide.addText("OIDD 6670 · Group 6 · The Wharton School · 2026", {
    x: 0.5, y: H - 0.5, w: W - 1, h: 0.3,
    fontFace: FONT, fontSize: 10, color: C.slate400, align: "center", margin: 0,
  });
}

// ==========================================================================
// APPENDIX DIVIDER
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.slate900 };
  slide.addText("APPENDIX", {
    x: 0.5, y: H / 2 - 0.7, w: W - 1, h: 0.6,
    fontFace: FONT, fontSize: 18, color: C.emerald, align: "center", charSpacing: 8, margin: 0,
  });
  slide.addText("Master Prompt · Build Stages · Edge Cases · Test Cases", {
    x: 0.5, y: H / 2, w: W - 1, h: 1.0,
    fontFace: FONT, fontSize: 32, bold: true, color: C.white, align: "center", margin: 0,
  });
  slide.addText("Required by the rubric: PLAN Prompt Engineering (10 pts)", {
    x: 0.5, y: H / 2 + 1.0, w: W - 1, h: 0.5,
    fontFace: FONT, fontSize: 14, italic: true, color: C.slate400, align: "center", margin: 0,
  });
}

// ==========================================================================
// SLIDE A1 — Master Prompt
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Appendix A · Master Prompt", "The single prompt that guided the entire build");

  // Code-style block
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 2.6, w: W - 1, h: 4.3,
    fill: { color: C.slate900 }, line: { color: C.slate900, width: 0 }, rectRadius: 0.1,
  });
  slide.addText([
    { text: "I want to build CareerTwin — ", options: { color: C.emerald, bold: true } },
    { text: "the digital twin for career management. A persistent web app that turns fragmented career information into one living memory layer.\n\n", options: { color: "E2E8F0" } },

    { text: "THE PROBLEM: ", options: { color: C.emerald, bold: true } },
    { text: "Most undergrads have no real career mentorship. Existing AI tools are stateless — users re-explain themselves every session. Career switchers and non-traditional applicants get the least support.\n\n", options: { color: "E2E8F0" } },

    { text: "USERS: ", options: { color: C.emerald, bold: true } },
    { text: "undergraduate students, working professionals, and career switchers. Non-technical.\n\n", options: { color: "E2E8F0" } },

    { text: "CORE FEATURES (MVP only):\n", options: { color: C.emerald, bold: true } },
    { text: "  1. Onboarding Q&A (conversational, persona-classified)\n", options: { color: "E2E8F0" } },
    { text: "  2. Resume builder (one-page MBA-style → editable → PDF)\n", options: { color: "E2E8F0" } },
    { text: "  3. Cover letter (paste JD → tailored letter)\n", options: { color: "E2E8F0" } },
    { text: "  4. Thank-you email (debrief notes → personalized email)\n", options: { color: "E2E8F0" } },
    { text: "  5. Career highlights (one milestone → LinkedIn post + resume bullet)\n\n", options: { color: "E2E8F0" } },

    { text: "DATA MODEL: ", options: { color: C.emerald, bold: true } },
    { text: "8 RLS-protected Postgres tables — profiles, experiences, education, resumes, applications, coffee_chats, career_highlights, ai_audit_log\n\n", options: { color: "E2E8F0" } },

    { text: "AUTH: ", options: { color: C.emerald, bold: true } },
    { text: "email/password via Supabase. Standard user role only. RLS isolates all data per user.\n\n", options: { color: "E2E8F0" } },

    { text: "TREAT ME AS PRODUCT OWNER. ", options: { color: C.emerald, bold: true, italic: true } },
    { text: "Build in stages I can test. Stop at forks; explain options. Every Claude prompt: include a safety preamble, use few-shot examples, never fabricate facts.", options: { color: "E2E8F0", italic: true } },
  ], {
    x: 0.7, y: 2.7, w: W - 1.4, h: 4.1,
    fontFace: "Consolas", fontSize: 10.5, valign: "top", margin: 0,
  });

  pageNumber(slide, 12, TOTAL);
}

// ==========================================================================
// SLIDE A2 — Build Stages
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Appendix B · Build Stages", "What we asked AI to build — first, second, third…");

  const stages = [
    { n: "1", title: "Scaffold + Auth + DB", body: "Next.js 16 · Supabase · 8 tables with RLS · email/password auth. STOP and verify isolation with 2 incognito accounts before adding AI." },
    { n: "2", title: "Onboarding + Persona", body: "Conversational 8-step Q&A. Claude classifies user as Student / Professional / Switcher → save permanently. AI fallback: retry once, manual override." },
    { n: "3", title: "Resume Builder", body: "Few-shot prompt with Wharton alumni resumes. User keywords → professional bullets. Edit textarea → Publish → one-page PDF via jsPDF + html2canvas." },
    { n: "4", title: "Cover Letter", body: "Paste JD → Claude references stored resume + JD. Save to applications table. Past applications clickable to view." },
    { n: "5", title: "Thank-you Email", body: "Coffee-chat debrief notes → personalized email referencing actual topics. Clipboard fallback (no Outlook OAuth — graded equally)." },
    { n: "6", title: "Career Highlights", body: "One milestone → LinkedIn post + resume bullet. Server-side merge: promotion auto-updates resume title progression. Bullet auto-flows on next regen." },
    { n: "7", title: "Polish + Ship", body: "Empty states · skeleton shimmers · tone defaults per feature · responsible-AI audit log · 1-page user guide · presentation deck. Deploy on Vercel." },
  ];

  const startY = 2.55;
  const rowH = 0.65;
  stages.forEach((s, i) => {
    const y = startY + i * rowH;
    // Number circle
    slide.addShape(pres.shapes.OVAL, {
      x: 0.5, y: y + 0.05, w: 0.55, h: 0.55,
      fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    });
    slide.addText(s.n, {
      x: 0.5, y: y + 0.05, w: 0.55, h: 0.55,
      fontFace: FONT, fontSize: 18, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
    slide.addText(s.title, {
      x: 1.25, y: y + 0.0, w: 3.4, h: rowH,
      fontFace: FONT, fontSize: 13, bold: true, color: C.slate900,
      valign: "middle", margin: 0,
    });
    slide.addText(s.body, {
      x: 4.7, y: y + 0.05, w: W - 5.2, h: rowH,
      fontFace: FONT, fontSize: 10.5, color: C.slate700,
      valign: "middle", margin: 0,
    });
  });

  pageNumber(slide, 13, TOTAL);
}

// ==========================================================================
// SLIDE A3 — Edge Cases
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Appendix C · Edge Cases", "What if the user does X? — and what we do");

  const edges = [
    { trigger: "Anthropic API returns 429 / 503 / 529", response: "Auto-retry 4 attempts with exponential backoff (1s · 2s · 4s)" },
    { trigger: "User skips contact info on resume", response: "Omit the contact line entirely — never use [email] placeholder" },
    { trigger: "User skips a date or location", response: "Render `[add date]` placeholder — never invent" },
    { trigger: "User types implausible highlight (CEO at 2-yr role)", response: "Include it anyway — user controls via editor, AI doesn't second-guess" },
    { trigger: "User types multiple events in one highlight", response: "Group into one thematic LinkedIn narrative; don't pick one and drop the rest" },
    { trigger: "User edits a saved job in onboarding", response: "Form pre-fills with existing data → Save replaces in place" },
    { trigger: "Supabase rejects column name (`current_role` reserved)", response: "Renamed to `present_role` in schema (caught at first migration)" },
    { trigger: "User signs up but doesn't verify email", response: "Email confirmation disabled in Supabase → instant login" },
    { trigger: "User regenerates resume after editing", response: "New version saved; full version history clickable + read-only" },
    { trigger: "User B tries to access User A's data", response: "Postgres RLS policies block at the DB level — query returns empty" },
    { trigger: "Resume content overflows one page", response: "PDF stretches to fit 8.5×11 letter; prompt also targets ~35-45 lines" },
    { trigger: "User has no job history (full-time student)", response: "Onboarding is optional on Experience step; resume still generated" },
  ];

  // 2 columns of 6 each
  const cols = 2;
  const rows = Math.ceil(edges.length / cols);
  const startY = 2.55;
  const rowH = 0.42;
  const colW = (W - 1.0) / cols;

  edges.forEach((e, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const x = 0.5 + col * colW;
    const y = startY + row * rowH;

    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.0, y: y + 0.05, w: 0.06, h: rowH - 0.1,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 },
    });
    slide.addText([
      { text: e.trigger + " ", options: { color: C.slate900, bold: true } },
      { text: "→ " + e.response, options: { color: C.slate600 || C.slate700 } },
    ], {
      x: x + 0.18, y, w: colW - 0.3, h: rowH,
      fontFace: FONT, fontSize: 10.5, valign: "middle", margin: 0,
    });
  });

  pageNumber(slide, 14, TOTAL);
}

// ==========================================================================
// SLIDE A4 — Test Cases
// ==========================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  brandMark(slide);
  slideTitle(slide, "Appendix D · Test Cases", "What we ran after each build stage");

  const tests = [
    {
      stage: "Stage 1: Auth + DB",
      cases: [
        "Sign up with valid email — lands on dashboard with empty profile state",
        "Sign up with duplicate email — clear error message",
        "Wrong password on login — clear error, no leaking which side was wrong",
        "Two incognito sessions — User B's dashboard cannot see User A's data (RLS)",
      ],
    },
    {
      stage: "Stage 2: Onboarding",
      cases: [
        "Complete all 8 steps — persona classified to one of 3 valid values",
        "Skip optional fields (contact, career-gap) — saves successfully",
        "Edit a saved job — form pre-fills, save replaces in place",
        "Refresh mid-onboarding — progress preserved (form state survives)",
      ],
    },
    {
      stage: "Stage 3-6: AI Features",
      cases: [
        "Generate resume — buffs raw keywords into action-verb bullets with real numbers preserved",
        "Cover letter with real Stripe JD — references both the JD and stored resume",
        "Thank-you with debrief notes mentioning Rust + a book recommendation — output references both specifically",
        "Promotion highlight — title line auto-updates to progression format",
        "PDF download — exactly one page, no print dialog, contact line omits blank fields",
      ],
    },
    {
      stage: "Stage 7: Polish + Deploy",
      cases: [
        "Mobile viewport (375px) — all forms usable, sidebar collapses",
        "Anthropic 529 error — auto-retry succeeds; logged in ai_audit_log",
        "Click past resume version — read-only view expands, copy works",
      ],
    },
  ];

  const startY = 2.45;
  const groupGap = 0.15;
  let y = startY;

  tests.forEach((group) => {
    // Group header
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 0.06, h: 0.32,
      fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    });
    slide.addText(group.stage, {
      x: 0.65, y, w: W - 1.15, h: 0.32,
      fontFace: FONT, fontSize: 13, bold: true, color: C.slate900,
      valign: "middle", margin: 0,
    });
    y += 0.36;

    // Cases
    const caseHeight = 0.3;
    group.cases.forEach((c) => {
      slide.addText("✓", {
        x: 0.7, y, w: 0.3, h: caseHeight,
        fontFace: FONT, fontSize: 11, bold: true, color: C.emerald, margin: 0, valign: "middle",
      });
      slide.addText(c, {
        x: 1.0, y, w: W - 1.5, h: caseHeight,
        fontFace: FONT, fontSize: 10.5, color: C.slate700,
        valign: "middle", margin: 0,
      });
      y += caseHeight - 0.02;
    });

    y += groupGap;
  });

  pageNumber(slide, 15, TOTAL);
}

// ==========================================================================
// Write file
// ==========================================================================
pres.writeFile({ fileName: "C:\\Users\\rh238\\careercoach-ai\\CareerTwin-Presentation.pptx" })
  .then((file) => console.log("Wrote:", file))
  .catch((err) => { console.error(err); process.exit(1); });
