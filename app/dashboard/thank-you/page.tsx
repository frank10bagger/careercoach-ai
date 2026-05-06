import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ThankYouWorkspace from './thank-you-workspace';

export default async function ThankYouPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user!.id)
    .single();

  const { data: chats } = await supabase
    .from('coffee_chats')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (!profile?.onboarding_complete) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Thank-you emails</h1>
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
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Thank-you emails</h1>
      <p className="text-slate-600 mb-8">
        After a coffee chat or interview, paste in what you actually discussed and we&apos;ll draft a thank-you that references the specifics.
      </p>
      <ThankYouWorkspace chats={chats ?? []} />
    </div>
  );
}
