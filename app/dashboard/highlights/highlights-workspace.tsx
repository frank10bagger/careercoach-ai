'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Highlight = {
  id: string;
  highlight_date: string | null;
  raw_description: string;
  linkedin_post: string | null;
  resume_bullet: string | null;
  created_at: string;
};

export default function HighlightsWorkspace({ highlights }: { highlights: Highlight[] }) {
  const [highlightDate, setHighlightDate] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ linkedin_post: string; resume_bullet: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const router = useRouter();

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!rawDescription.trim()) return;
    setError(null);
    setGenerating(true);
    setGenerated(null);

    const res = await fetch('/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ highlightDate, rawDescription }),
    });

    setGenerating(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Generation failed' }));
      setError(error || 'Generation failed');
      return;
    }
    const data = await res.json();
    setGenerated({ linkedin_post: data.linkedin_post, resume_bullet: data.resume_bullet });
    setHighlightDate('');
    setRawDescription('');
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex gap-2">
        <span aria-hidden>⚠️</span>
        <span><strong>AI-generated content.</strong> Edit before posting publicly. Your saved bullet auto-appears in future resume generations — review the resume text and remove if you don&apos;t want it.</span>
      </div>

      <form onSubmit={handleGenerate} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">When did this happen?</label>
          <input
            type="text"
            value={highlightDate}
            onChange={(e) => setHighlightDate(e.target.value)}
            placeholder="e.g. March 2026, or 'last week'"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">What happened?</label>
          <p className="text-xs text-slate-500 mb-1.5">
            ONE moment per highlight — a promotion, a launch, an award, a milestone. AI will build the full story around it.
          </p>
          <textarea
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
            rows={3}
            required
            placeholder="e.g. 'Got promoted to Senior Consultant at Bain.' or 'Closed our first $1M enterprise deal.' or 'Shipped the v2 launch after 6 months of work.'"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
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
          {generating ? 'Polishing your story...' : '✨ Generate LinkedIn post + resume bullet'}
        </button>
      </form>

      {generated && (
        <div className="space-y-4">
          <ArtifactCard
            title="LinkedIn post"
            value={generated.linkedin_post}
            onCopy={() => copyText('new-li', generated.linkedin_post)}
            copied={copiedKey === 'new-li'}
          />
          <ArtifactCard
            title="Resume bullet"
            value={generated.resume_bullet}
            onCopy={() => copyText('new-rb', generated.resume_bullet)}
            copied={copiedKey === 'new-rb'}
            small
          />
          <p className="text-xs text-slate-500">
            ✓ Saved. The resume bullet will appear when you next generate your resume.
          </p>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Past highlights</h3>
          <p className="text-xs text-slate-500 mb-3">Click any item to view both versions.</p>
          <ul className="space-y-2">
            {highlights.map((h) => {
              const isOpen = openId === h.id;
              return (
                <li key={h.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenId(isOpen ? null : h.id)}
                    className="w-full p-3 flex justify-between items-center text-sm hover:bg-slate-50 transition text-left"
                  >
                    <span className="text-slate-700 flex items-center gap-2 truncate">
                      <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>›</span>
                      <span className="truncate">{h.raw_description.slice(0, 60)}{h.raw_description.length > 60 ? '...' : ''}</span>
                    </span>
                    <span className="text-slate-400 text-xs whitespace-nowrap ml-2">
                      {h.highlight_date || new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      {h.linkedin_post && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1.5">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">LinkedIn post</p>
                            <button
                              onClick={() => copyText(`li-${h.id}`, h.linkedin_post || '')}
                              className="text-xs text-emerald-700 hover:underline"
                            >
                              {copiedKey === `li-${h.id}` ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed whitespace-pre-wrap">
                            {h.linkedin_post}
                          </div>
                        </div>
                      )}
                      {h.resume_bullet && (
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Resume bullet</p>
                            <button
                              onClick={() => copyText(`rb-${h.id}`, h.resume_bullet || '')}
                              className="text-xs text-emerald-700 hover:underline"
                            >
                              {copiedKey === `rb-${h.id}` ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed">
                            {h.resume_bullet}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">Original input</p>
                        <p className="text-xs text-slate-500 italic">{h.raw_description}</p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function ArtifactCard({
  title, value, onCopy, copied, small,
}: {
  title: string; value: string; onCopy: () => void; copied: boolean; small?: boolean;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          onClick={onCopy}
          className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className={`whitespace-pre-wrap font-sans text-slate-800 leading-relaxed ${small ? 'text-sm' : 'text-sm'}`}>
        {value}
      </pre>
    </div>
  );
}
