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

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-slate-600 mb-8">
        {profile?.onboarding_complete
          ? `You're targeting ${profile.target_role || 'a new role'}${profile.target_industry ? ` in ${profile.target_industry}` : ''}.`
          : 'Complete your profile to unlock the AI-tailored features.'}
      </p>

      {!profile?.onboarding_complete && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <h2 className="font-semibold text-amber-900 mb-1">Get started</h2>
          <p className="text-sm text-amber-800 mb-4">
            Tell us about your background and goals. Takes about 3 minutes — and you&apos;ll never have to repeat it.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="inline-block px-4 py-2 bg-amber-900 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition"
          >
            Start onboarding →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Resumes" count={resumes.length} href="/dashboard/resume" cta="Generate resume" disabled={!profile?.onboarding_complete} />
        <Card title="Cover letters" count={applications.length} href="/dashboard/cover-letter" cta="Draft cover letter" disabled={!profile?.onboarding_complete} />
        <Card title="Thank-you emails" count={chats.length} href="/dashboard/thank-you" cta="Draft thank-you" disabled={!profile?.onboarding_complete} />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentList
          title="Recent resumes"
          empty="No resumes yet."
          items={resumes.map((r) => ({ label: r.target_role || 'Untitled', sub: new Date(r.created_at).toLocaleDateString() }))}
        />
        <RecentList
          title="Recent applications"
          empty="No applications yet."
          items={applications.map((a) => ({ label: `${a.job_title} @ ${a.company}`, sub: new Date(a.created_at).toLocaleDateString() }))}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  count,
  href,
  cta,
  disabled,
}: {
  title: string;
  count: number;
  href: string;
  cta: string;
  disabled?: boolean;
}) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1 mb-3">{count}</p>
      {disabled ? (
        <span className="text-sm text-slate-400">Complete profile first</span>
      ) : (
        <Link href={href} className="text-sm text-slate-900 font-medium hover:underline">
          {cta} →
        </Link>
      )}
    </div>
  );
}

function RecentList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; sub: string }[];
  empty: string;
}) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl">
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 5).map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-slate-700 truncate">{item.label}</span>
              <span className="text-slate-400 text-xs whitespace-nowrap ml-2">{item.sub}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
