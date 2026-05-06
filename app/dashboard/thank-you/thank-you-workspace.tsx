'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenerateSkeleton } from '../skeleton';

type Chat = {
  id: string;
  contact_name: string;
  contact_role: string | null;
  company: string | null;
  debrief_notes?: string | null;
  thank_you_email: string | null;
  created_at: string;
};

export default function ThankYouWorkspace({ chats }: { chats: Chat[] }) {
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [company, setCompany] = useState('');
  const [debriefNotes, setDebriefNotes] = useState('');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !debriefNotes.trim()) {
      setError('Contact name and debrief notes are required');
      return;
    }
    setError(null);
    setGenerating(true);

    const res = await fetch('/api/thank-you', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactName, contactRole, company, debriefNotes }),
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
        <span><strong>AI-generated content.</strong> Audit before sending — make sure the email accurately reflects what you actually discussed.</span>
      </div>

      <form onSubmit={handleGenerate} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Morgan Patel"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Their role</label>
            <input
              type="text"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              placeholder="Senior PM"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Stripe"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">What did you actually discuss?</label>
          <p className="text-xs text-slate-500 mb-1.5">
            Specific topics, advice they gave, things you committed to. The more concrete, the better the draft.
          </p>
          <textarea
            value={debriefNotes}
            onChange={(e) => setDebriefNotes(e.target.value)}
            rows={8}
            required
            placeholder="We talked about how their team structures product reviews, their suggestion to read X, my interest in Y, and I committed to sending them my notes on Z..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
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
          {generating ? 'Drafting...' : 'Draft thank-you email'}
        </button>
      </form>

      {generating && !output && (
        <GenerateSkeleton rows={8} label="Drafting your thank-you email..." />
      )}

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
          <p className="text-xs text-slate-500">
            Paste this into Outlook or Gmail. We don&apos;t send emails directly — you stay in control.
          </p>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={16}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
      )}

      {chats.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Past coffee chats</h3>
          <p className="text-xs text-slate-500 mb-3">Click any item to view the saved thank-you email.</p>
          <ul className="space-y-2">
            {chats.map((c) => {
              const isOpen = openId === c.id;
              return (
                <li key={c.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenId(isOpen ? null : c.id)}
                    className="w-full p-3 flex justify-between items-center text-sm hover:bg-slate-50 transition text-left"
                  >
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>›</span>
                      {c.contact_name}
                      {c.company && <span className="text-slate-400 ml-1">@ {c.company}</span>}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                      {c.thank_you_email && (
                        <div className="mt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Thank-you email</p>
                          <div className="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed whitespace-pre-wrap">
                            {c.thank_you_email}
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(c.thank_you_email || '')}
                            className="mt-2 text-xs text-emerald-700 hover:underline"
                          >
                            Copy to clipboard
                          </button>
                        </div>
                      )}
                      {c.debrief_notes && (
                        <div className="mt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Debrief notes</p>
                          <div className="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed whitespace-pre-wrap text-slate-600 max-h-40 overflow-y-auto">
                            {c.debrief_notes}
                          </div>
                        </div>
                      )}
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
