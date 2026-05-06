import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-300/40 via-teal-200/30 to-transparent blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-200/40 via-orange-200/20 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-sky-100/30 to-emerald-100/30 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-12 sm:py-16">
        {/* Brand mark */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-full shadow-sm">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-slate-700">Live · Built for OIDD 6670 · Group 6</span>
          </div>
        </div>

        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight leading-[1.05]">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">CareerTwin</span>
              <br />
              <span className="text-slate-900">the digital twin for your career.</span>
            </h1>
            <p className="text-xl text-slate-700 leading-relaxed mb-8">
              A 5-minute conversation with AI to activate your
              <br />
              <span className="font-semibold text-slate-900">AI Career Twin</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="px-7 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-slate-900/20 transition-all hover:-translate-y-0.5 text-center"
              >
                Get started — it&apos;s free
              </Link>
              <Link
                href="/login"
                className="px-7 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition shadow-sm text-center"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Hero illustration: career memory mesh */}
          <div className="relative h-[420px] flex items-center justify-center">
            <CareerMesh />
          </div>
        </div>

        {/* Feature row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <FeatureCard
            color="emerald"
            icon={<DocIcon />}
            title="Tailored resume"
            body="One-page resume in MBA-alumni style. Edit, then publish to PDF."
          />
          <FeatureCard
            color="sky"
            icon={<MailIcon />}
            title="Personal cover letter"
            body="Paste a job description. Get a 350-word letter referencing both the JD and your stored profile."
          />
          <FeatureCard
            color="amber"
            icon={<ChatIcon />}
            title="Smart thank-you emails"
            body="After a coffee chat, drop in your debrief notes. Get a follow-up that references the actual conversation."
          />
          <FeatureCard
            color="violet"
            icon={<StarIcon />}
            title="Career highlights"
            body="One sentence in. Polished LinkedIn post + auto-flowing resume bullet out."
          />
        </div>

        {/* Trust strip */}
        <div className="mt-14 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
          <span>Powered by Claude Sonnet 4.6</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>Postgres RLS user isolation</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>$0 forever for class demo</span>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// Hero illustration: a "career memory mesh" — central node ringed by career assets
// ============================================================================
function CareerMesh() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full max-w-md drop-shadow-xl">
      <defs>
        <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Concentric rings */}
      <circle cx="200" cy="200" r="170" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
      <circle cx="200" cy="200" r="120" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      <circle cx="200" cy="200" r="70" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />

      {/* Connecting lines from center */}
      {[
        [200, 50], [340, 130], [340, 270], [200, 350], [60, 270], [60, 130],
      ].map(([x, y], i) => (
        <line key={i} x1="200" y1="200" x2={x} y2={y} stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.5" />
      ))}

      {/* Outer asset nodes */}
      <AssetNode cx={200} cy={50} label="Resume" color="#10b981" />
      <AssetNode cx={340} cy={130} label="Cover letter" color="#0ea5e9" />
      <AssetNode cx={340} cy={270} label="Coffee chat" color="#f59e0b" />
      <AssetNode cx={200} cy={350} label="Highlights" color="#8b5cf6" />
      <AssetNode cx={60} cy={270} label="LinkedIn" color="#0284c7" />
      <AssetNode cx={60} cy={130} label="Goals" color="#dc2626" opacity={0.7} />

      {/* Inner satellite dots (memory fragments) */}
      <circle cx="280" cy="180" r="3" fill="#10b981" opacity="0.6" />
      <circle cx="160" cy="270" r="3" fill="#0ea5e9" opacity="0.6" />
      <circle cx="240" cy="130" r="3" fill="#f59e0b" opacity="0.6" />
      <circle cx="130" cy="160" r="3" fill="#8b5cf6" opacity="0.6" />

      {/* Center node */}
      <circle cx="200" cy="200" r="42" fill="url(#centerGrad)" />
      <circle cx="200" cy="200" r="42" fill="none" stroke="white" strokeWidth="2" opacity="0.9" />
      <text x="200" y="195" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">YOUR</text>
      <text x="200" y="212" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">CAREER</text>

      {/* Pulse ring */}
      <circle cx="200" cy="200" r="42" fill="none" stroke="#10b981" strokeWidth="2">
        <animate attributeName="r" from="42" to="70" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.6" to="0" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function AssetNode({ cx, cy, label, color, opacity = 1 }: { cx: number; cy: number; label: string; color: string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r="22" fill="white" stroke={color} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="6" fill={color} />
      <text x={cx} y={cy + 40} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">{label}</text>
    </g>
  );
}

// ============================================================================
// Feature card
// ============================================================================
const COLORS: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700' },
};

function FeatureCard({ icon, title, body, color }: { icon: React.ReactNode; title: string; body: string; color: string }) {
  const c = COLORS[color] || COLORS.emerald;
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}

function DocIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}
function MailIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
}
function ChatIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function StarIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
