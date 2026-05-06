'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ResumePreview from './resume-preview';

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
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openVersionId, setOpenVersionId] = useState<string | null>(null);
  const [versionCopiedId, setVersionCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function copyVersion(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setVersionCopiedId(id);
    setTimeout(() => setVersionCopiedId(null), 1500);
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePublish() {
    setShowPreview(true);
    // Smooth scroll to preview after render
    setTimeout(() => {
      document.getElementById('resume-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  async function handleDownloadPdf() {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter', compress: true });
    // Always fit to exactly one page — fills full 8.5x11 page.
    // The internal padding of the resume preview gives it natural margins; no PDF margin needed.
    pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11, undefined, 'FAST');
    pdf.save(`resume-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    setShowPreview(false);
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
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex gap-2 print:hidden">
        <span aria-hidden>⚠️</span>
        <span><strong>AI-generated content.</strong> Audit every line before you click Publish — Claude can phrase things imperfectly or interpret your keywords differently than you intended.</span>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
        >
          {generating ? 'Generating...' : latest ? 'Regenerate' : `Generate resume for ${profile.target_role || 'target role'}`}
        </button>
        {content && (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save edits'}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              {copied ? 'Copied!' : 'Copy text'}
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Publish →
            </button>
          </>
        )}
      </div>

      {content && !generating && !showPreview && (
        <p className="text-xs text-slate-500 print:hidden">
          Edit the plain text below, then click <span className="font-medium text-emerald-700">Publish</span> to see the formatted preview and download as PDF.
        </p>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 print:hidden">
          {error}
        </div>
      )}

      {!content && !generating && (
        <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 print:hidden">
          No resume yet. Click <span className="font-medium text-slate-700">Generate resume</span> to create one from your profile.
        </div>
      )}

      {(content || generating) && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          placeholder={generating ? 'Generating your resume...' : ''}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg font-mono text-xs leading-relaxed focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none print:hidden"
        />
      )}

      {showPreview && content && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between print:hidden">
            <h3 className="font-semibold text-slate-900">Formatted preview</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-3 py-1.5 text-sm bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Back to editor
              </button>
              <button
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Download PDF
              </button>
            </div>
          </div>
          <ResumePreview content={content} />
          <p className="text-xs text-slate-400 text-center print:hidden">
            Click <span className="font-medium">Download PDF</span> → in the print dialog choose <span className="font-medium">&ldquo;Save as PDF&rdquo;</span> as the destination.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="pt-6 border-t border-slate-200 print:hidden">
          <h3 className="font-semibold text-slate-900 mb-2">Version history</h3>
          <p className="text-xs text-slate-500 mb-3">Click any past version to view it (read-only).</p>
          <ul className="space-y-2">
            {history.map((r) => {
              const isOpen = openVersionId === r.id;
              return (
                <li key={r.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenVersionId(isOpen ? null : r.id)}
                    className="w-full p-3 flex justify-between items-center text-sm hover:bg-slate-50 transition text-left"
                  >
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>›</span>
                      v{r.version} — {r.target_role || 'Untitled'}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(r.created_at).toLocaleString()}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-center mt-3 mb-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Saved resume (read-only)</p>
                        <button
                          onClick={() => copyVersion(r.id, r.content_text)}
                          className="text-xs text-emerald-700 hover:underline"
                        >
                          {versionCopiedId === r.id ? 'Copied!' : 'Copy text'}
                        </button>
                      </div>
                      <pre className="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {r.content_text}
                      </pre>
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
