import { createClient } from '@/lib/supabase/server';
import OnboardingForm from './onboarding-form';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, expRes, eduRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('experiences').select('*').eq('user_id', user!.id).order('position_order'),
    supabase.from('education').select('*').eq('user_id', user!.id).order('position_order'),
  ]);

  const profile = profileRes.data;
  const initialExperiences = (expRes.data ?? []).map((e) => ({
    company: e.company || '',
    title: e.title || '',
    location: e.location || '',
    start_date: e.start_date || '',
    end_date: e.end_date || '',
    raw_keywords: e.raw_keywords || '',
  }));
  const initialEducations = (eduRes.data ?? []).map((e) => ({
    school: e.school || '',
    degree: e.degree || '',
    field_of_study: e.field_of_study || '',
    start_year: e.start_year || '',
    graduation_year: e.graduation_year || '',
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Tell us about you</h1>
      <p className="text-slate-600 mb-8">
        A few quick questions. We&apos;ll save your answers permanently — you&apos;ll never re-enter them.
      </p>
      <OnboardingForm
        initial={profile ?? {}}
        initialExperiences={initialExperiences}
        initialEducations={initialEducations}
      />
    </div>
  );
}
