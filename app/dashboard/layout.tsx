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
        <Link href="/dashboard" className="block mb-8">
          <h1 className="text-xl font-bold text-slate-900">CareerCoach AI</h1>
        </Link>

        <div className="mb-6 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm font-medium text-slate-900 truncate">
            {profile?.full_name || user.email}
          </p>
          {profile?.persona_type && (
            <p className="text-xs text-slate-500 mt-1">
              {personaLabel[profile.persona_type]}
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink href="/dashboard">Home</NavLink>
          <NavLink href="/dashboard/onboarding">
            {profile?.onboarding_complete ? 'Edit profile' : 'Complete profile'}
          </NavLink>
          <NavLink href="/dashboard/resume">Resume</NavLink>
          <NavLink href="/dashboard/cover-letter">Cover letters</NavLink>
          <NavLink href="/dashboard/thank-you">Thank-you emails</NavLink>
        </nav>

        <LogoutButton />
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition"
    >
      {children}
    </Link>
  );
}
