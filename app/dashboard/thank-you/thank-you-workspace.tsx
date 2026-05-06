'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Chat = {
  id: string;
  contact_name: string;
  contact_role: string | null;
  company: string | null;
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
          <ul className="space-y-2">
            {chats.map((c) => (
              <li key={c.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between text-sm">
                <span className="text-slate-700">
                  {c.contact_name}
                  {c.company && <span className="text-slate-400"> @ {c.company}</span>}
                </span>
                <span className="text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
