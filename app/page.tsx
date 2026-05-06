import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">CareerCoach AI</h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-2">
          AI career mentor for undergraduate students.
        </p>
        <p className="text-base text-slate-500 mb-10">
          From self-discovery to signed offer — resume, cover letter, and thank-you email,
          tailored to who you are and the internships and roles you want.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Log in
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-12">
          Built for OIDD 6670 · Group 6 · The Wharton School
        </p>
      </div>
    </main>
  );
}
