'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
  full_name?: string;
  present_role?: string;
  years_experience?: number;
  target_role?: string;
  target_industry?: string;
  top_achievements?: string;
  career_gap?: string;
};

export default function OnboardingForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState({
    fullName: initial.full_name || '',
    presentRole: initial.present_role || '',
    yearsExperience: initial.years_experience?.toString() || '',
    targetRole: initial.target_role || '',
    targetIndustry: initial.target_industry || '',
    topAchievements: initial.top_achievements || '',
    careerGap: initial.career_gap || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Unknown error' }));
      setError(error || 'Failed to save profile');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <Field
        label="Full name"
        value={form.fullName}
        onChange={(v) => setForm({ ...form, fullName: v })}
        placeholder="Joseph Wharton"
        required
      />
      <Field
        label="Current role"
        sublabel="Your present job title and company, e.g. 'Senior Consultant at Bain' or 'MBA student at Wharton'"
        value={form.presentRole}
        onChange={(v) => setForm({ ...form, presentRole: v })}
        required
      />
      <Field
        label="Years of full-time experience"
        type="number"
        value={form.yearsExperience}
        onChange={(v) => setForm({ ...form, yearsExperience: v })}
        placeholder="3"
        required
      />
      <Field
        label="Target role"
        sublabel="The role you want next, e.g. 'Product Manager' or 'VP of Strategy'"
        value={form.targetRole}
        onChange={(v) => setForm({ ...form, targetRole: v })}
        required
      />
      <Field
        label="Target industry"
        sublabel="e.g. 'Fintech', 'Healthcare', 'Tech', 'Private Equity'"
        value={form.targetIndustry}
        onChange={(v) => setForm({ ...form, targetIndustry: v })}
        required
      />
      <TextArea
        label="Top 3 achievements"
        sublabel="Career wins you're most proud of. Quantify where possible."
        value={form.topAchievements}
        onChange={(v) => setForm({ ...form, topAchievements: v })}
        rows={5}
        required
      />
      <TextArea
        label="Career gap or pivot context (optional)"
        sublabel="Anything we should know — career break, industry switch, etc."
        value={form.careerGap}
        onChange={(v) => setForm({ ...form, careerGap: v })}
        rows={3}
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
      >
        {loading ? 'Classifying your persona...' : 'Save and continue'}
      </button>
    </form>
  );
}

function Field({
  label,
  sublabel,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {sublabel && <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{sublabel}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  sublabel,
  value,
  onChange,
  rows = 4,
  required,
}: {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {sublabel && <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{sublabel}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
      />
    </div>
  );
}
