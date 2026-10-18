-- CareLink.AI additive persistence tables for reviews and AI chat history.
-- Safe to re-run; does not delete existing records.
create extension if not exists pgcrypto;

create table if not exists public.doctor_reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text not null default '',
  created_at timestamptz not null default now()
);

alter table public.doctor_reviews enable row level security;
drop policy if exists "Patients can read doctor reviews" on public.doctor_reviews;
create policy "Patients can read doctor reviews"
  on public.doctor_reviews for select to authenticated using (true);
drop policy if exists "Patients can submit own doctor reviews" on public.doctor_reviews;
create policy "Patients can submit own doctor reviews"
  on public.doctor_reviews for insert to authenticated
  with check (patient_id = auth.uid());

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'CareLink assistant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_updated_idx
  on public.ai_conversations(user_id, updated_at desc);
create index if not exists ai_messages_conversation_created_idx
  on public.ai_messages(conversation_id, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
drop policy if exists "Users manage own AI conversations" on public.ai_conversations;
create policy "Users manage own AI conversations"
  on public.ai_conversations for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users manage own AI messages" on public.ai_messages;
create policy "Users manage own AI messages"
  on public.ai_messages for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Appointments use owner_id in the current CareLink.AI schema.
alter table public.appointments enable row level security;
drop policy if exists "Users read own appointments" on public.appointments;
create policy "Users read own appointments"
  on public.appointments for select to authenticated
  using (owner_id = auth.uid());
drop policy if exists "Users create own appointments" on public.appointments;
create policy "Users create own appointments"
  on public.appointments for insert to authenticated
  with check (owner_id = auth.uid());
