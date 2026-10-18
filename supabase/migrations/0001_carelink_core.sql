-- CareLink.AI fresh-project schema. Apply only in the new, intended Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.hospitals (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 city text not null default 'Machilipatnam',
 address text not null default '',
 description text not null default '',
 image_url text not null default '',
 phone text not null default '',
 category text not null default 'Multispecialty',
 is_verified boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.doctors (
 id uuid primary key default gen_random_uuid(),
 hospital_id uuid references public.hospitals(id) on delete set null,
 full_name text not null,
 specialty text not null default 'General Medicine',
 experience_years integer not null default 1 check (experience_years >= 0),
 image_url text not null default '',
 created_at timestamptz not null default now()
);
create table if not exists public.appointments (
 id uuid primary key default gen_random_uuid(),
 patient_id uuid not null references auth.users(id) on delete cascade,
 doctor_id uuid references public.doctors(id) on delete set null,
 hospital_id uuid references public.hospitals(id) on delete set null,
 patient_name text not null,
 appointment_date date not null,
 notes text not null default '',
 status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
 created_at timestamptz not null default now()
);
create table if not exists public.doctor_reviews (
 id uuid primary key default gen_random_uuid(),
 patient_id uuid not null references auth.users(id) on delete cascade,
 doctor_id uuid not null references public.doctors(id) on delete cascade,
 rating integer not null check (rating between 1 and 5),
 review_text text not null default '',
 created_at timestamptz not null default now(),
 unique(patient_id, doctor_id)
);
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
 role text not null check (role in ('user','assistant')),
 content text not null,
 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.hospitals enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.doctor_reviews enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "Profiles read own" on public.profiles;
create policy "Profiles read own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Hospitals visible to everyone" on public.hospitals;
create policy "Hospitals visible to everyone" on public.hospitals for select to anon, authenticated using (true);
drop policy if exists "Doctors visible to everyone" on public.doctors;
create policy "Doctors visible to everyone" on public.doctors for select to anon, authenticated using (true);
drop policy if exists "Patients read own appointments" on public.appointments;
create policy "Patients read own appointments" on public.appointments for select to authenticated using (auth.uid() = patient_id);
drop policy if exists "Patients book own appointments" on public.appointments;
create policy "Patients book own appointments" on public.appointments for insert to authenticated with check (auth.uid() = patient_id);
drop policy if exists "Patients cancel own appointments" on public.appointments;
create policy "Patients cancel own appointments" on public.appointments for update to authenticated using (auth.uid() = patient_id) with check (auth.uid() = patient_id);
drop policy if exists "Reviews are public" on public.doctor_reviews;
create policy "Reviews are public" on public.doctor_reviews for select to anon, authenticated using (true);
drop policy if exists "Patients submit own reviews" on public.doctor_reviews;
create policy "Patients submit own reviews" on public.doctor_reviews for insert to authenticated with check (auth.uid() = patient_id);
drop policy if exists "Patients edit own reviews" on public.doctor_reviews;
create policy "Patients edit own reviews" on public.doctor_reviews for update to authenticated using (auth.uid() = patient_id) with check (auth.uid() = patient_id);
drop policy if exists "Users read own AI conversations" on public.ai_conversations;
create policy "Users read own AI conversations" on public.ai_conversations for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own AI conversations" on public.ai_conversations;
create policy "Users create own AI conversations" on public.ai_conversations for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users read own AI messages" on public.ai_messages;
create policy "Users read own AI messages" on public.ai_messages for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own AI messages" on public.ai_messages;
create policy "Users create own AI messages" on public.ai_messages for insert to authenticated with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
 insert into public.profiles (id, full_name)
 values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
 on conflict (id) do nothing;
 return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.hospitals (name, city, address, description, image_url, category)
select 'CareLink Community Hospital (Sample)', 'Machilipatnam', 'Machilipatnam, Andhra Pradesh',
 'Sample listing only. Replace with sourced, current facility information before production.',
 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80', 'Multispecialty'
where not exists (select 1 from public.hospitals);
