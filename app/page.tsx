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

      <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {/* Brand mark */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-full shadow-sm">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-slate-700">Live · Built for OIDD 6670 · Group 6</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.05]">
            Your AI career mentor
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              that actually remembers you.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-2">
            From self-discovery to signed offer — resume, cover letter, and thank-you email,
            tailored to who you are and what you want.
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            For undergraduate students, working professionals, and career switchers.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/signup"
            className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition shadow-sm"
          >
            Log in
          </Link>
        </div>

        {/* Feature row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
            title="Tailored resume"
            body="Generate a one-page resume in the style of Wharton MBA alumni — formatted, downloadable as PDF."
          />
          <FeatureCard
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
            title="Personal cover letter"
            body="Paste a job description; we draft a 350-word letter referencing both the role and your background."
          />
          <FeatureCard
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            title="Smart thank-you emails"
            body="After a coffee chat, drop in your debrief notes — get a personalized follow-up referencing the actual conversation."
          />
        </div>

        {/* Trust strip */}
        <div className="mt-16 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
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

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
