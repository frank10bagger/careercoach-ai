// Renders plain-text resume as styled preview. Uses inline styles + hex colors
// (NOT Tailwind oklch classes) so html2canvas/jsPDF capture it cleanly.

const SECTION_HEADERS = new Set([
  'EXECUTIVE SUMMARY', 'SUMMARY', 'EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
  'EDUCATION', 'SKILLS', 'ADDITIONAL INFORMATION', 'CERTIFICATIONS',
  'LEADERSHIP', 'PROJECTS', 'INTERESTS',
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

const TEXT = '#1a1a1a';
const MUTED = '#555555';
const BORDER = '#cccccc';

export default function ResumePreview({ content }: { content: string }) {
  const lines = content.split('\n');
  const name = (lines[0] || '').trim();
  const contact = (lines[1] || '').trim();
  const body = lines.slice(2).map(classify);

  return (
    <div
      id="resume-preview"
      style={{
        background: '#ffffff',
        color: TEXT,
        padding: '40px 48px',
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        fontFamily: '"Calibri", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        fontSize: 13,
        lineHeight: 1.45,
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      {name && (
        <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', margin: '0 0 4px 0', color: TEXT }}>
          {name}
        </h1>
      )}
      {contact && (
        <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', margin: '0 0 20px 0' }}>{contact}</p>
      )}

      <div>
        {body.map((b, i) => {
          if (b.type === 'blank') return <div key={i} style={{ height: 6 }} />;
          if (b.type === 'section') {
            return (
              <h2
                key={i}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: TEXT,
                  margin: '14px 0 6px 0',
                  paddingBottom: 3,
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                {b.text}
              </h2>
            );
          }
          if (b.type === 'twocol') {
            const looksLikeCompany = /^[A-Z &.,'-]{3,}$/.test(b.left);
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  margin: '2px 0',
                }}
              >
                <span style={{ fontWeight: looksLikeCompany ? 700 : 400, color: TEXT }}>{b.left}</span>
                <span style={{ color: MUTED, whiteSpace: 'nowrap' }}>{b.right}</span>
              </div>
            );
          }
          if (b.type === 'bullet') {
            return (
              <div key={i} style={{ display: 'flex', gap: 8, marginLeft: 12, margin: '3px 0 3px 12px' }}>
                <span style={{ color: MUTED, marginTop: 2 }}>•</span>
                <span style={{ flex: 1, color: TEXT }}>{b.text}</span>
              </div>
            );
          }
          return <p key={i} style={{ margin: '3px 0', color: TEXT }}>{b.text}</p>;
        })}
      </div>
    </div>
  );
}
