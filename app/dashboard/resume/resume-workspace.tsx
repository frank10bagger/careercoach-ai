'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Resume = {
  id: string;
  content_text: string;
  target_role: string | null;
  version: number;
  created_at: string;
};

export default function ResumeWorkspace({
  profile,
  latest,
  history,
}: {
  profile: { target_role?: string };
  latest: Resume | null;
  history: Resume[];
}) {
  const [content, setContent] = useState(latest?.content_text || '');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    const res = await fetch('/api/resume', { method: 'POST' });
    setGenerating(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Generation failed' }));
      setError(error || 'Generation failed');
      return;
    }
    const data = await res.json();
    setContent(data.content);
    router.refresh();
  }

  async function handleSave() {
    if (!content.trim()) return;
    setError(null);
    setSaving(true);
    const res = await fetch('/api/resume', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Save failed' }));
      setError(error || 'Save failed');
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
        >
          {generating ? 'Generating...' : latest ? 'Regenerate' : `Generate resume for ${profile.target_role || 'target role'}`}
        </button>
        {content && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save edits as new version'}
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {!content && !generating && (
        <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500">
          No resume yet. Click <span className="font-medium text-slate-700">Generate resume</span> to create one from your profile.
        </div>
      )}

      {(content || generating) && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={28}
          placeholder={generating ? 'Generating your resume...' : ''}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm leading-relaxed focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        />
      )}

      {history.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-2">Version history</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            {history.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span>v{r.version} — {r.target_role || 'untitled'}</span>
                <span className="text-slate-400">{new Date(r.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
