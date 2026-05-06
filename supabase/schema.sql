-- CareerCoach AI — Database Schema
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run)
-- Idempotent: safe to re-run.

-- =========================================================================
-- 1. PROFILES — user profile, persona, target industry/role
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  present_role text,
  years_experience integer,
  target_role text,
  target_industry text,
  top_achievements text,
  career_gap text,
  persona_type text check (persona_type in ('student', 'professional', 'switcher')),
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================================
-- 2. EXPERIENCES — work history (one row per job)
-- =========================================================================
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text,
  title text,
  start_date text,
  end_date text,
  raw_keywords text,
  achievements text,
  skills text,
  position_order integer default 0,
  created_at timestamptz default now()
);

-- Idempotent migration for existing tables (Postgres doesn't error on ADD COLUMN IF NOT EXISTS)
alter table public.experiences add column if not exists raw_keywords text;
alter table public.experiences add column if not exists position_order integer default 0;
alter table public.experiences add column if not exists location text;

-- =========================================================================
-- 2b. EDUCATION — degrees / schools (one row per entry)
-- =========================================================================
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school text,
  degree text,
  field_of_study text,
  start_year text,
  graduation_year text,
  honors text,
  position_order integer default 0,
  created_at timestamptz default now()
);

alter table public.education add column if not exists start_year text;

alter table public.education enable row level security;
drop policy if exists "own education" on public.education;
create policy "own education" on public.education for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- =========================================================================
-- 3. SKILLS — hard/soft/leadership
-- =========================================================================
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hard_skills text,
  soft_skills text,
  leadership_skills text,
  industry_knowledge text,
  skill_gaps text,
  created_at timestamptz default now()
);

-- =========================================================================
-- 4. RESUMES — generated resumes (versioned)
-- =========================================================================
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_text text not null,
  target_role text,
  version integer default 1,
  created_at timestamptz default now()
);

-- =========================================================================
-- 5. APPLICATIONS — job applications + cover letters
-- =========================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  job_title text not null,
  job_description text,
  cover_letter text,
  status text default 'drafted',
  created_at timestamptz default now()
);

-- =========================================================================
-- 6. COFFEE_CHATS — networking conversations + thank-you emails
-- =========================================================================
create table if not exists public.coffee_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_name text not null,
  contact_role text,
  company text,
  debrief_notes text,
  thank_you_email text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- =========================================================================
-- 7. INTERVIEW_PREPS — placeholder for stretch feature
-- =========================================================================
create table if not exists public.interview_preps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text not null,
  company text not null,
  questions_and_frameworks text,
  created_at timestamptz default now()
);

-- =========================================================================
-- 8. AI_AUDIT_LOG — every AI call (governance / responsible AI)
-- =========================================================================
create table if not exists public.ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  prompt_summary text,
  output_summary text,
  tokens_used integer,
  was_mocked boolean default false,
  created_at timestamptz default now()
);

-- =========================================================================
-- ROW LEVEL SECURITY — every table is per-user only
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.skills enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;
alter table public.coffee_chats enable row level security;
alter table public.interview_preps enable row level security;
alter table public.ai_audit_log enable row level security;

-- Drop existing policies (idempotent)
drop policy if exists "users see own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "own experiences" on public.experiences;
drop policy if exists "own skills" on public.skills;
drop policy if exists "own resumes" on public.resumes;
drop policy if exists "own applications" on public.applications;
drop policy if exists "own coffee chats" on public.coffee_chats;
drop policy if exists "own interview preps" on public.interview_preps;
drop policy if exists "own audit log" on public.ai_audit_log;

-- profiles: read/insert/update only your own row
create policy "users see own profile" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "users update own profile" on public.profiles
  for update using ((select auth.uid()) = id);
create policy "users insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);

-- All other tables: ALL operations only on rows where user_id = auth.uid()
create policy "own experiences" on public.experiences for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own skills" on public.skills for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own resumes" on public.resumes for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own applications" on public.applications for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own coffee chats" on public.coffee_chats for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own interview preps" on public.interview_preps for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own audit log" on public.ai_audit_log for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- =========================================================================
-- TRIGGER — auto-create profile row on signup
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
