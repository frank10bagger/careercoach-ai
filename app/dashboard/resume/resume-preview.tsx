// Renders the plain-text resume Claude generates as a styled, print-ready preview.
// Heuristics:
//  - Line 0 = NAME (centered, large, bold)
//  - Line 1 = contact line (centered, muted)
//  - ALL-CAPS lines = section headers (uppercase tracking, bottom border)
//  - "Company  ...  Location" / "Title  ...  Dates" two-column lines (split on 2+ spaces)
//  - Lines starting with "-" = bullets
//  - Other = body paragraphs

const SECTION_HEADERS = new Set([
  'EXECUTIVE SUMMARY', 'SUMMARY', 'EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
  'EDUCATION', 'SKILLS', 'ADDITIONAL INFORMATION', 'CERTIFICATIONS',
  'LEADERSHIP', 'PROJECTS',
]);

function classify(line: string) {
  const t = line.trim();
  if (!t) return { type: 'blank' as const };
  if (SECTION_HEADERS.has(t) || (/^[A-Z][A-Z &/-]{2,40}$/.test(t) && t.length < 40)) {
    return { type: 'section' as const, text: t };
  }
  if (t.startsWith('-') || t.startsWith('•') || t.startsWith('*')) {
    return { type: 'bullet' as const, text: t.replace(/^[-•*]\s*/, '') };
  }
  const m = line.match(/^(.+?)\s{2,}(.+)$/);
  if (m) {
    return { type: 'twocol' as const, left: m[1].trim(), right: m[2].trim() };
  }
  return { type: 'body' as const, text: t };
}

export default function ResumePreview({ content }: { content: string }) {
  const lines = content.split('\n');
  const name = (lines[0] || '').trim();
  const contact = (lines[1] || '').trim();
  const body = lines.slice(2).map(classify);

  return (
    <div
      id="resume-preview"
      className="bg-white p-12 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-0 print:rounded-none print:p-0"
      style={{ fontFamily: '"Calibri", "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      {name && (
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-1">
          {name}
        </h1>
      )}
      {contact && (
        <p className="text-sm text-slate-500 text-center mb-6">{contact}</p>
      )}

      <div className="space-y-1 text-[13px] leading-snug text-slate-800">
        {body.map((b, i) => {
          if (b.type === 'blank') return <div key={i} className="h-2" />;
          if (b.type === 'section') {
            return (
              <h2
                key={i}
                className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 pt-3 mb-1"
              >
                {b.text}
              </h2>
            );
          }
          if (b.type === 'twocol') {
            const looksLikeCompany = /^[A-Z &.,'-]{3,}$/.test(b.left);
            return (
              <div key={i} className="flex justify-between gap-4">
                <span className={looksLikeCompany ? 'font-semibold' : ''}>{b.left}</span>
                <span className="text-slate-600 whitespace-nowrap">{b.right}</span>
              </div>
            );
          }
          if (b.type === 'bullet') {
            return (
              <div key={i} className="flex gap-2 ml-3">
                <span className="text-slate-400 mt-0.5">•</span>
                <span className="flex-1">{b.text}</span>
              </div>
            );
          }
          return <p key={i}>{b.text}</p>;
        })}
      </div>
    </div>
  );
}
