'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Application = {
  id: string;
  company: string;
  job_title: string;
  cover_letter: string | null;
  created_at: string;
};

export default function CoverLetterWorkspace({
  applications,
}: {
  applications: Application[];
}) {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !jobTitle.trim() || !jobDescription.trim()) return;
    setError(null);
    setGenerating(true);

    const res = await fetch('/api/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, jobTitle, jobDescription }),
    });

    setGenerating(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Generation failed' }));
      setError(error || 'Generation failed');
      return;
    }
    const data = await res.json();
    setOutput(data.content);
    router.refresh();
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex gap-2">
        <span aria-hidden>⚠️</span>
        <span><strong>AI-generated content.</strong> Audit every paragraph before sending — verify the AI didn&apos;t over-claim experience or misread the job description.</span>
      </div>

      <form onSubmit={handleGenerate} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Stripe"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Product Manager"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job description</label>
          <p className="text-xs text-slate-500 mb-1.5">Paste the full description from the company&apos;s career page.</p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={generating}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
        >
          {generating ? 'Drafting your letter...' : 'Generate cover letter'}
        </button>
      </form>

      {output && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-slate-900">Draft</h3>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
      )}

      {applications.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Past applications</h3>
          <ul className="space-y-2">
            {applications.map((a) => (
              <li key={a.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between text-sm">
                <span className="text-slate-700">{a.job_title} @ {a.company}</span>
                <span className="text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
