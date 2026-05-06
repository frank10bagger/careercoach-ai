import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ResumeWorkspace from './resume-workspace';

export default async function ResumePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const { data: resumes } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (!profile?.onboarding_complete) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume</h1>
        <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-900 font-medium mb-2">Profile not complete</p>
          <p className="text-sm text-amber-800 mb-4">
            We need your background to tailor a resume. Complete onboarding first.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="inline-block px-4 py-2 bg-amber-900 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition"
          >
            Go to onboarding →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume</h1>
      <p className="text-slate-600 mb-8">
        Generate a tailored resume from your profile. You can edit it inline before saving a new version.
      </p>
      <ResumeWorkspace
        profile={profile}
        latest={resumes?.[0] || null}
        history={resumes ?? []}
      />
    </div>
  );
}
