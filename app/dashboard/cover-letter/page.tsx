import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CoverLetterWorkspace from './cover-letter-workspace';

export default async function CoverLetterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete, target_role')
    .eq('id', user!.id)
    .single();

  const { data: latestResume } = await supabase
    .from('resumes')
    .select('id, content_text')
    .eq('user_id', user!.id)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (!profile?.onboarding_complete) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cover letters</h1>
        <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-900 font-medium mb-2">Profile not complete</p>
          <Link
            href="/dashboard/onboarding"
            className="inline-block px-4 py-2 bg-amber-900 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition mt-2"
          >
            Go to onboarding →
          </Link>
        </div>
      </div>
    );
  }

  if (!latestResume) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cover letters</h1>
        <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-900 font-medium mb-2">Generate a resume first</p>
          <p className="text-sm text-amber-800 mb-4">
            Cover letters reference your resume. Create one before drafting cover letters.
          </p>
          <Link
            href="/dashboard/resume"
            className="inline-block px-4 py-2 bg-amber-900 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition"
          >
            Go to resume →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Cover letters</h1>
      <p className="text-slate-600 mb-8">
        Paste a job description and we&apos;ll draft a tailored letter using your resume.
      </p>
      <CoverLetterWorkspace applications={applications ?? []} />
    </div>
  );
}
