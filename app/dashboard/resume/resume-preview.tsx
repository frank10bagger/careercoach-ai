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
const SECTION_BORDER = '#999999';

export default function ResumePreview({ content }: { content: string }) {
  const lines = content.split('\n');
  const name = (lines[0] || '').trim();
  const possibleContact = (lines[1] || '').trim();
  const hasContactSignal = /[@]/.test(possibleContact)
    || /\d{3,}/.test(possibleContact)
    || /linkedin/i.test(possibleContact);
  const contact = hasContactSignal ? possibleContact : '';
  const body = (hasContactSignal ? lines.slice(2) : lines.slice(1)).map(classify);

  return (
    <div
      id="resume-preview"
      style={{
        background: '#ffffff',
        color: TEXT,
        padding: '56px 64px',
        fontFamily: '"Calibri", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        fontSize: 14.5,
        lineHeight: 1.5,
        maxWidth: 850,
        margin: '0 auto',
      }}
    >
      {name && (
        <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: '0 0 6px 0', color: TEXT, letterSpacing: '0.5px' }}>
          {name}
        </h1>
      )}
      {contact && (
        <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', margin: '0 0 24px 0' }}>{contact}</p>
      )}

      <div>
        {body.map((b, i) => {
          if (b.type === 'blank') return <div key={i} style={{ height: 6 }} />;
          if (b.type === 'section') {
            return (
              <h2
                key={i}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.4,
                  color: TEXT,
                  margin: '20px 0 10px 0',
                  paddingBottom: 5,
                  borderBottom: `1px solid ${SECTION_BORDER}`,
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
                  margin: '4px 0',
                }}
              >
                <span style={{ fontWeight: looksLikeCompany ? 700 : 400, color: TEXT }}>{b.left}</span>
                <span style={{ color: MUTED, whiteSpace: 'nowrap' }}>{b.right}</span>
              </div>
            );
          }
          if (b.type === 'bullet') {
            return (
              <div key={i} style={{ display: 'flex', gap: 10, marginLeft: 14, margin: '5px 0 5px 14px' }}>
                <span style={{ color: MUTED, marginTop: 1 }}>•</span>
                <span style={{ flex: 1, color: TEXT }}>{b.text}</span>
              </div>
            );
          }
          return <p key={i} style={{ margin: '5px 0', color: TEXT }}>{b.text}</p>;
        })}
      </div>
    </div>
  );
}
