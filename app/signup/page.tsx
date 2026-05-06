'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-300/30 to-transparent blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-200/30 to-transparent blur-3xl" />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 p-8 relative z-10 fade-in">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-base font-bold shadow-md group-hover:shadow-lg transition-shadow">
            C
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">CareerCoach AI</span>
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p className="text-sm text-slate-500 mb-6">Start building your career story.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Full name"
            value={fullName}
            onChange={setFullName}
            placeholder="Joseph Wharton"
            required
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            minLength={6}
            required
            hint="At least 6 characters."
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-slate-900/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, required, minLength, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-shadow"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
