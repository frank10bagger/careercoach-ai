import { createClient } from '@/lib/supabase/server';
import OnboardingForm from './onboarding-form';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Tell us about you</h1>
      <p className="text-slate-600 mb-8">
        Six quick questions. We&apos;ll save your answers permanently — you&apos;ll never re-enter them.
      </p>
      <OnboardingForm initial={profile ?? {}} />
    </div>
  );
}
