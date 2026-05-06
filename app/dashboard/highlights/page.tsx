import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import HighlightsWorkspace from './highlights-workspace';

export default async function HighlightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user!.id)
    .single();

  const { data: highlights } = await supabase
    .from('career_highlights')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (!profile?.onboarding_complete) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Career Highlights</h1>
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

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Career Highlights</h1>
      <p className="text-slate-600 mb-8">
        Capture your career-defining moments. We&apos;ll polish each one into a LinkedIn post and a resume bullet — and the bullet auto-flows into your next resume generation.
      </p>
      <HighlightsWorkspace highlights={highlights ?? []} />
    </div>
  );
}
