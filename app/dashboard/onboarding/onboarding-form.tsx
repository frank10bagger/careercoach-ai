'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Experience = { company: string; title: string; start_date: string; end_date: string; raw_keywords: string };
type Education = { school: string; degree: string; field_of_study: string; graduation_year: string };

type Profile = {
  full_name?: string;
  present_role?: string;
  years_experience?: number;
  target_role?: string;
  target_industry?: string;
  top_achievements?: string;
  career_gap?: string;
};

const TOTAL_STEPS = 8;

export default function OnboardingForm({ initial }: { initial: Profile }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [fullName, setFullName] = useState(initial.full_name || '');
  const [presentRole, setPresentRole] = useState(initial.present_role || '');
  const [yearsExperience, setYearsExperience] = useState(initial.years_experience?.toString() || '');
  const [targetRole, setTargetRole] = useState(initial.target_role || '');
  const [targetIndustry, setTargetIndustry] = useState(initial.target_industry || '');
  const [careerGap, setCareerGap] = useState(initial.career_gap || '');

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        presentRole,
        yearsExperience,
        targetRole,
        targetIndustry,
        careerGap,
        experiences,
        educations,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Save failed' }));
      setError(error || 'Save failed');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return true;
      case 1: return fullName.trim().length > 0;
      case 2: return presentRole.trim().length > 0;
      case 3: return yearsExperience.trim().length > 0;
      case 4: return true; // experiences optional but encouraged
      case 5: return true; // education optional
      case 6: return targetRole.trim().length > 0;
      case 7: return targetIndustry.trim().length > 0;
      default: return true;
    }
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <div className="min-h-[280px] mt-6">
        {step === 0 && <Welcome />}
        {step === 1 && <NameStep value={fullName} onChange={setFullName} />}
        {step === 2 && <PresentRoleStep value={presentRole} onChange={setPresentRole} />}
        {step === 3 && <YearsStep value={yearsExperience} onChange={setYearsExperience} />}
        {step === 4 && <ExperienceStep items={experiences} setItems={setExperiences} />}
        {step === 5 && <EducationStep items={educations} setItems={setEducations} />}
        {step === 6 && <TargetRoleStep value={targetRole} onChange={setTargetRole} />}
        {step === 7 && <TargetIndustryStep value={targetIndustry} onChange={setTargetIndustry} />}
        {step === 8 && (
          <Review
            data={{ fullName, presentRole, yearsExperience, targetRole, targetIndustry, careerGap, experiences, educations }}
            onCareerGapChange={setCareerGap}
            careerGap={careerGap}
          />
        )}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={back}
          disabled={step === 0}
          className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-30"
        >
          ← Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            onClick={next}
            disabled={!canAdvance()}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
          >
            {step === 0 ? "Let's go →" : 'Next →'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {submitting ? 'Saving and classifying...' : 'Save my profile ✓'}
          </button>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>Step {current} of {total}</span>
        <span>{Math.round(pct)}% complete</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuestionHeader({ ai, hint }: { ai: string; hint?: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-medium text-emerald-600 mb-2">CAREERCOACH</p>
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">{ai}</h2>
      {hint && <p className="text-sm text-slate-500 mt-2">{hint}</p>}
    </div>
  );
}

function Welcome() {
  return (
    <div>
      <p className="text-xs font-medium text-emerald-600 mb-2">CAREERCOACH</p>
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug mb-4">
        Hi 👋 I&apos;m your AI career coach.
      </h2>
      <p className="text-slate-600 leading-relaxed mb-3">
        I&apos;ll ask you a few questions about your background and where you want to go next. Takes ~3 minutes.
      </p>
      <p className="text-slate-600 leading-relaxed">
        For your work and education, just give me <span className="font-medium text-slate-900">keywords and numbers</span> — I&apos;ll do the heavy lifting and buff them into proper resume bullets when you generate your resume.
      </p>
    </div>
  );
}

function NameStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="What's your full name?" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Joseph Wharton"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function PresentRoleStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="What do you do today?" hint="Your present job title and company. Or 'MBA student at Wharton' if you're in school." />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Senior Consultant at Bain & Company"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function YearsStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="How many years of full-time work experience do you have?" hint="Round to the nearest year. Internships don't count." />
      <input
        autoFocus
        type="number"
        min="0"
        max="50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="4"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function ExperienceStep({ items, setItems }: { items: Experience[]; setItems: (e: Experience[]) => void }) {
  const [draft, setDraft] = useState<Experience>({ company: '', title: '', start_date: '', end_date: '', raw_keywords: '' });
  const [showForm, setShowForm] = useState(items.length === 0);

  function addItem() {
    if (!draft.company.trim() || !draft.title.trim()) return;
    setItems([...items, draft]);
    setDraft({ company: '', title: '', start_date: '', end_date: '', raw_keywords: '' });
    setShowForm(false);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <QuestionHeader
        ai="Now tell me about your work experience."
        hint="Add each job. For accomplishments, just type keywords and numbers — AI will buff them up later."
      />

      {items.length > 0 && (
        <ul className="space-y-2 mb-4">
          {items.map((e, i) => (
            <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start text-sm">
              <div>
                <p className="font-medium text-slate-900">{e.title} @ {e.company}</p>
                <p className="text-xs text-slate-500">{e.start_date} – {e.end_date || 'Present'}</p>
                {e.raw_keywords && <p className="text-xs text-slate-600 mt-1">{e.raw_keywords}</p>}
              </div>
              <button onClick={() => removeItem(i)} className="text-xs text-slate-400 hover:text-red-600 ml-3">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} placeholder="Company" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Job title" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} placeholder="Start (e.g. 2021)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.end_date} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} placeholder="End (or 'present')" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Keywords + numbers from this role</label>
            <textarea
              value={draft.raw_keywords}
              onChange={(e) => setDraft({ ...draft, raw_keywords: e.target.value })}
              rows={4}
              placeholder="e.g. 'led $42M cost reduction project, fintech client, team of 8, SQL/Python segmentation, 3.2x ROI campaign'"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition">
              Save this job
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-white text-slate-900 border border-dashed border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
          + Add {items.length === 0 ? 'a job' : 'another job'}
        </button>
      )}
    </div>
  );
}

function EducationStep({ items, setItems }: { items: Education[]; setItems: (e: Education[]) => void }) {
  const [draft, setDraft] = useState<Education>({ school: '', degree: '', field_of_study: '', graduation_year: '' });
  const [showForm, setShowForm] = useState(items.length === 0);

  function addItem() {
    if (!draft.school.trim() || !draft.degree.trim()) return;
    setItems([...items, draft]);
    setDraft({ school: '', degree: '', field_of_study: '', graduation_year: '' });
    setShowForm(false);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <QuestionHeader ai="Tell me about your education." hint="Add each degree — undergrad, graduate, professional certifications." />

      {items.length > 0 && (
        <ul className="space-y-2 mb-4">
          {items.map((e, i) => (
            <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start text-sm">
              <div>
                <p className="font-medium text-slate-900">{e.degree}{e.field_of_study ? ` in ${e.field_of_study}` : ''}</p>
                <p className="text-xs text-slate-500">{e.school}{e.graduation_year ? ` · ${e.graduation_year}` : ''}</p>
              </div>
              <button onClick={() => removeItem(i)} className="text-xs text-slate-400 hover:text-red-600 ml-3">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} placeholder="School (e.g. Wharton)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} placeholder="Degree (e.g. MBA)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.field_of_study} onChange={(e) => setDraft({ ...draft, field_of_study: e.target.value })} placeholder="Major (optional)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.graduation_year} onChange={(e) => setDraft({ ...draft, graduation_year: e.target.value })} placeholder="Year (e.g. 2026)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition">
              Save this degree
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-white text-slate-900 border border-dashed border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
          + Add {items.length === 0 ? 'a degree' : 'another degree'}
        </button>
      )}
    </div>
  );
}

function TargetRoleStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="What role do you want next?" hint="Be specific. 'Senior Product Manager' beats 'a tech job'." />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Senior Product Manager"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function TargetIndustryStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="And what industry?" hint="e.g. Fintech · Healthcare · B2B SaaS · Private Equity · Climate" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Fintech"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function Review({
  data,
  careerGap,
  onCareerGapChange,
}: {
  data: {
    fullName: string; presentRole: string; yearsExperience: string;
    targetRole: string; targetIndustry: string; careerGap: string;
    experiences: Experience[]; educations: Education[];
  };
  careerGap: string;
  onCareerGapChange: (v: string) => void;
}) {
  return (
    <div>
      <QuestionHeader
        ai="Last thing — anything I should know?"
        hint="Career gap, industry pivot, or any context that explains your story. Optional."
      />
      <textarea
        value={careerGap}
        onChange={(e) => onCareerGapChange(e.target.value)}
        rows={3}
        placeholder="e.g. 'Switching from consulting to product management to build, not just advise.'"
        className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none mb-6"
      />
      <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
        <p className="font-semibold text-slate-900 mb-2">Quick review:</p>
        <p><span className="text-slate-500">Name:</span> {data.fullName}</p>
        <p><span className="text-slate-500">Now:</span> {data.presentRole}</p>
        <p><span className="text-slate-500">Years:</span> {data.yearsExperience}</p>
        <p><span className="text-slate-500">Jobs added:</span> {data.experiences.length}</p>
        <p><span className="text-slate-500">Degrees added:</span> {data.educations.length}</p>
        <p><span className="text-slate-500">Targeting:</span> {data.targetRole} in {data.targetIndustry}</p>
      </div>
    </div>
  );
}
