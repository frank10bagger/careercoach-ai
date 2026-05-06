import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from './logout-button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, persona_type, onboarding_complete')
    .eq('id', user.id)
    .single();

  const personaLabel: Record<string, string> = {
    student: 'Student',
    professional: 'Professional',
    switcher: 'Career Switcher',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <Link href="/dashboard" className="block mb-8 group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
              C
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">CareerCoach AI</h1>
          </div>
        </Link>

        <div className="mb-6 p-3 bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-xl border border-slate-100">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Signed in as</p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {profile?.full_name || user.email}
          </p>
          {profile?.persona_type && (
            <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full">
              {personaLabel[profile.persona_type]}
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-0.5">
          <NavLink href="/dashboard" icon={<HomeIcon />}>Home</NavLink>
          <NavLink href="/dashboard/onboarding" icon={<UserIcon />}>
            {profile?.onboarding_complete ? 'Edit profile' : 'Complete profile'}
          </NavLink>
          <NavLink href="/dashboard/resume" icon={<DocIcon />}>Resume</NavLink>
          <NavLink href="/dashboard/cover-letter" icon={<EnvelopeIcon />}>Cover letters</NavLink>
          <NavLink href="/dashboard/thank-you" icon={<ChatIcon />}>Thank-you emails</NavLink>
        </nav>

        <LogoutButton />
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition group"
    >
      <span className="text-slate-400 group-hover:text-emerald-600 transition-colors">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function DocIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
function EnvelopeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
}
function ChatIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
