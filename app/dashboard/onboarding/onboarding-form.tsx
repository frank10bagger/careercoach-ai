'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Experience = { company: string; title: string; location: string; start_date: string; end_date: string; raw_keywords: string };
type Education = { school: string; degree: string; field_of_study: string; start_year: string; graduation_year: string };

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
      case 3: return yearsExperience.trim().length >= 0; // 0 is valid for student
      case 4: return true;
      case 5: return true;
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
            data={{ fullName, presentRole, yearsExperience, targetRole, targetIndustry, experiences, educations }}
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
        Built for undergraduate students figuring out internships and first full-time roles. I&apos;ll ask a few questions about your background and goals — takes about 3 minutes.
      </p>
      <p className="text-slate-600 leading-relaxed">
        For your work and education, just give me <span className="font-medium text-slate-900">keywords and numbers</span>. I&apos;ll do the heavy lifting and turn them into proper resume bullets when you generate your resume.
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
      <QuestionHeader ai="What do you do today?" hint="Your year and major if you're a student, or your current job title and company if you're working." />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Sophomore, Computer Science at Wharton"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function YearsStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="How many years of work experience do you have?" hint="Internships count too. Just a rough number — 0 is fine." />
      <input
        autoFocus
        type="number"
        min="0"
        max="50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

const EMPTY_EXP: Experience = { company: '', title: '', location: '', start_date: '', end_date: '', raw_keywords: '' };

function ExperienceStep({ items, setItems }: { items: Experience[]; setItems: (e: Experience[]) => void }) {
  const [draft, setDraft] = useState<Experience>(EMPTY_EXP);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(items.length === 0);

  function startAdd() {
    setDraft(EMPTY_EXP);
    setEditIndex(null);
    setShowForm(true);
  }

  function startEdit(i: number) {
    setDraft(items[i]);
    setEditIndex(i);
    setShowForm(true);
  }

  function saveDraft() {
    if (!draft.company.trim() || !draft.title.trim()) return;
    if (editIndex !== null) {
      const copy = [...items];
      copy[editIndex] = draft;
      setItems(copy);
    } else {
      setItems([...items, draft]);
    }
    setDraft(EMPTY_EXP);
    setEditIndex(null);
    setShowForm(false);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <QuestionHeader
        ai="Tell me about your work experience."
        hint="Add each job or internship. For accomplishments, just type keywords and numbers — AI will buff them up later."
      />

      {items.length > 0 && (
        <ul className="space-y-2 mb-4">
          {items.map((e, i) => (
            <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start text-sm">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{e.title} @ {e.company}</p>
                <p className="text-xs text-slate-500">
                  {e.location ? `${e.location} · ` : ''}{e.start_date} – {e.end_date || 'Present'}
                </p>
                {e.raw_keywords && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{e.raw_keywords}</p>}
              </div>
              <div className="flex gap-2 ml-3">
                <button onClick={() => startEdit(i)} className="text-xs text-blue-600 hover:underline">Edit</button>
                <button onClick={() => removeItem(i)} className="text-xs text-slate-400 hover:text-red-600">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} placeholder="Company" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Job title" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Location (e.g. New York, NY)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} placeholder="Start (e.g. Jun 2024)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
              <input type="text" value={draft.end_date} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} placeholder="End (or 'Present')" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Keywords + numbers from this role</label>
            <textarea
              value={draft.raw_keywords}
              onChange={(e) => setDraft({ ...draft, raw_keywords: e.target.value })}
              rows={4}
              placeholder="e.g. 'data analysis SQL Python, automated weekly reports saved 5 hours/week, 3 stakeholder presentations'"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={saveDraft} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition">
              {editIndex !== null ? 'Update job' : 'Save this job'}
            </button>
            <button onClick={() => { setShowForm(false); setDraft(EMPTY_EXP); setEditIndex(null); }} className="px-4 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={startAdd} className="px-4 py-2 bg-white text-slate-900 border border-dashed border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
          + Add {items.length === 0 ? 'a job or internship' : 'another job or internship'}
        </button>
      )}
    </div>
  );
}

const EMPTY_EDU: Education = { school: '', degree: '', field_of_study: '', start_year: '', graduation_year: '' };

function EducationStep({ items, setItems }: { items: Education[]; setItems: (e: Education[]) => void }) {
  const [draft, setDraft] = useState<Education>(EMPTY_EDU);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(items.length === 0);

  function startAdd() {
    setDraft(EMPTY_EDU);
    setEditIndex(null);
    setShowForm(true);
  }

  function startEdit(i: number) {
    setDraft(items[i]);
    setEditIndex(i);
    setShowForm(true);
  }

  function saveDraft() {
    if (!draft.school.trim() || !draft.degree.trim()) return;
    if (editIndex !== null) {
      const copy = [...items];
      copy[editIndex] = draft;
      setItems(copy);
    } else {
      setItems([...items, draft]);
    }
    setDraft(EMPTY_EDU);
    setEditIndex(null);
    setShowForm(false);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <QuestionHeader ai="Tell me about your education." hint="Add each degree — high school (if relevant), undergrad, exchange programs, certificates." />

      {items.length > 0 && (
        <ul className="space-y-2 mb-4">
          {items.map((e, i) => (
            <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start text-sm">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{e.degree}{e.field_of_study ? ` in ${e.field_of_study}` : ''}</p>
                <p className="text-xs text-slate-500">
                  {e.school}{(e.start_year || e.graduation_year) ? ` · ${e.start_year || '?'} – ${e.graduation_year || '?'}` : ''}
                </p>
              </div>
              <div className="flex gap-2 ml-3">
                <button onClick={() => startEdit(i)} className="text-xs text-blue-600 hover:underline">Edit</button>
                <button onClick={() => removeItem(i)} className="text-xs text-slate-400 hover:text-red-600">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} placeholder="School (e.g. Wharton)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} placeholder="Degree (e.g. BS, BA)" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <input type="text" value={draft.field_of_study} onChange={(e) => setDraft({ ...draft, field_of_study: e.target.value })} placeholder="Major / field of study" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={draft.start_year} onChange={(e) => setDraft({ ...draft, start_year: e.target.value })} placeholder="Start year" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
              <input type="text" value={draft.graduation_year} onChange={(e) => setDraft({ ...draft, graduation_year: e.target.value })} placeholder="End year" className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveDraft} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition">
              {editIndex !== null ? 'Update degree' : 'Save this degree'}
            </button>
            <button onClick={() => { setShowForm(false); setDraft(EMPTY_EDU); setEditIndex(null); }} className="px-4 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={startAdd} className="px-4 py-2 bg-white text-slate-900 border border-dashed border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition">
          + Add {items.length === 0 ? 'a degree' : 'another degree'}
        </button>
      )}
    </div>
  );
}

function TargetRoleStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="What role do you want next?" hint="Be specific. 'Software Engineer Intern' beats 'a tech job'." />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Software Engineer Intern"
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function TargetIndustryStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <QuestionHeader ai="And what industry?" hint="e.g. Tech · Finance · Consulting · Healthcare · Climate" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Tech"
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
    targetRole: string; targetIndustry: string;
    experiences: Experience[]; educations: Education[];
  };
  careerGap: string;
  onCareerGapChange: (v: string) => void;
}) {
  return (
    <div>
      <QuestionHeader
        ai="Last thing — anything else I should know?"
        hint="Career gap, industry pivot, or any context that explains your story. Optional."
      />
      <textarea
        value={careerGap}
        onChange={(e) => onCareerGapChange(e.target.value)}
        rows={3}
        placeholder="e.g. 'Switching from engineering to product to work closer to users.'"
        className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none mb-6"
      />
      <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
        <p className="font-semibold text-slate-900 mb-2">Quick review:</p>
        <p><span className="text-slate-500">Name:</span> {data.fullName}</p>
        <p><span className="text-slate-500">Now:</span> {data.presentRole}</p>
        <p><span className="text-slate-500">Years experience:</span> {data.yearsExperience}</p>
        <p><span className="text-slate-500">Jobs added:</span> {data.experiences.length}</p>
        <p><span className="text-slate-500">Degrees added:</span> {data.educations.length}</p>
        <p><span className="text-slate-500">Targeting:</span> {data.targetRole} in {data.targetIndustry}</p>
      </div>
    </div>
  );
}
