import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, resumesRes, applicationsRes, chatsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('resumes').select('id, target_role, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('applications').select('id, company, job_title, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('coffee_chats').select('id, contact_name, company, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }),
  ]);

  const profile = profileRes.data;
  const resumes = resumesRes.data ?? [];
  const applications = applicationsRes.data ?? [];
  const chats = chatsRes.data ?? [];

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : null;

  return (
    <div className="max-w-5xl">
      {/* Hero greeting */}
      <div className="mb-8">
        <p className="text-sm text-emerald-700 font-medium mb-1">{getGreeting()}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          Welcome{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="text-slate-600">
          {profile?.onboarding_complete
            ? `You're targeting ${profile.target_role || 'a new role'}${profile.target_industry ? ` in ${profile.target_industry}` : ''}.`
            : 'Complete your profile to unlock the AI-tailored features.'}
        </p>
      </div>

      {!profile?.onboarding_complete && (
        <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <SparkleIcon />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-amber-900 mb-1">Get started in 3 minutes</h2>
              <p className="text-sm text-amber-800 mb-4">
                Tell us about your background and goals. You&apos;ll never have to repeat it.
              </p>
              <Link
                href="/dashboard/onboarding"
                className="inline-block px-4 py-2 bg-amber-900 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition shadow-sm"
              >
                Start onboarding →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard
          title="Resumes"
          count={resumes.length}
          href="/dashboard/resume"
          cta="Generate resume"
          disabled={!profile?.onboarding_complete}
          accent="emerald"
          icon={<DocumentIcon />}
        />
        <StatCard
          title="Cover letters"
          count={applications.length}
          href="/dashboard/cover-letter"
          cta="Draft cover letter"
          disabled={!profile?.onboarding_complete}
          accent="sky"
          icon={<MailIcon />}
        />
        <StatCard
          title="Thank-you emails"
          count={chats.length}
          href="/dashboard/thank-you"
          cta="Draft thank-you"
          disabled={!profile?.onboarding_complete}
          accent="violet"
          icon={<HeartIcon />}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentList
          title="Recent resumes"
          empty="No resumes yet."
          href="/dashboard/resume"
          items={resumes.map((r) => ({ label: r.target_role || 'Untitled', sub: new Date(r.created_at).toLocaleDateString() }))}
        />
        <RecentList
          title="Recent applications"
          empty="No applications yet."
          href="/dashboard/cover-letter"
          items={applications.map((a) => ({ label: `${a.job_title} @ ${a.company}`, sub: new Date(a.created_at).toLocaleDateString() }))}
        />
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

const ACCENTS = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
};

function StatCard({
  title, count, href, cta, disabled, accent, icon,
}: {
  title: string; count: number; href: string; cta: string;
  disabled?: boolean; accent: keyof typeof ACCENTS; icon: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${a.bg} ${a.text} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`inline-block w-2 h-2 rounded-full ${a.dot} opacity-60`} />
      </div>
      <p className="text-sm text-slate-500 mb-0.5">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">{count}</p>
      {disabled ? (
        <span className="text-xs text-slate-400">Complete profile first</span>
      ) : (
        <Link href={href} className={`text-sm ${a.text} font-medium group-hover:underline inline-flex items-center gap-1`}>
          {cta}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}

function RecentList({
  title, items, empty, href,
}: {
  title: string;
  items: { label: string; sub: string }[];
  empty: string;
  href: string;
}) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        {items.length > 0 && (
          <Link href={href} className="text-xs text-emerald-700 font-medium hover:underline">
            View all →
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((item, i) => (
            <li key={i}>
              <Link
                href={href}
                className="flex justify-between items-center text-sm py-1.5 px-2 -mx-2 rounded-md hover:bg-slate-50 transition group"
              >
                <span className="text-slate-700 truncate group-hover:text-slate-900">{item.label}</span>
                <span className="text-slate-400 text-xs whitespace-nowrap ml-2">{item.sub}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Icons
function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
