create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('patient', 'provider');
  end if;
  if not exists (select 1 from pg_type where typname = 'reading_context') then
    create type reading_context as enum ('fasting', 'pre_meal', 'post_meal', 'bedtime');
  end if;
  if not exists (select 1 from pg_type where typname = 'meal_type') then
    create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');
  end if;
  if not exists (select 1 from pg_type where typname = 'med_log_status') then
    create type med_log_status as enum ('taken', 'missed');
  end if;
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type appointment_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'biomarker_type') then
    create type biomarker_type as enum ('hba1c', 'weight_kg', 'blood_pressure_sys', 'blood_pressure_dia');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'patient',
  full_name text not null,
  avatar_url text,
  timezone text default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_provider_assignments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (patient_id, provider_id)
);

create table if not exists public.onboarding_records (
  patient_id uuid primary key references public.profiles(id) on delete cascade,
  questionnaire jsonb not null default '{}'::jsonb,
  current_weight_kg numeric(6,2),
  baseline_hba1c numeric(4,2),
  primary_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biomarker_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  metric_type biomarker_type not null,
  value numeric(8,2) not null,
  unit text not null,
  measured_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.glucose_readings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  value_mg_dl integer not null check (value_mg_dl between 40 and 500),
  reading_context reading_context not null,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  meal_type meal_type not null,
  notes text not null,
  estimated_carbs integer not null check (estimated_carbs between 0 and 500),
  logged_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  dosage text not null,
  frequency text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  status med_log_status not null,
  logged_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  status appointment_status not null default 'requested',
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, provider_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists onboarding_set_updated_at on public.onboarding_records;
create trigger onboarding_set_updated_at
before update on public.onboarding_records
for each row execute function public.set_updated_at();

drop trigger if exists medications_set_updated_at on public.medications;
create trigger medications_set_updated_at
before update on public.medications
for each row execute function public.set_updated_at();

drop trigger if exists message_threads_set_updated_at on public.message_threads;
create trigger message_threads_set_updated_at
before update on public.message_threads
for each row execute function public.set_updated_at();

create index if not exists idx_assignments_provider on public.patient_provider_assignments(provider_id);
create index if not exists idx_assignments_patient on public.patient_provider_assignments(patient_id);
create index if not exists idx_glucose_patient_time on public.glucose_readings(patient_id, recorded_at desc);
create index if not exists idx_food_patient_time on public.food_logs(patient_id, logged_at desc);
create index if not exists idx_meds_patient on public.medications(patient_id);
create index if not exists idx_med_logs_patient_time on public.medication_logs(patient_id, logged_at desc);
create index if not exists idx_appointments_provider_time on public.appointments(provider_id, starts_at);
create index if not exists idx_appointments_patient_time on public.appointments(patient_id, starts_at);
create index if not exists idx_threads_provider on public.message_threads(provider_id);
create index if not exists idx_threads_patient on public.message_threads(patient_id);
create index if not exists idx_messages_thread_time on public.messages(thread_id, sent_at);

create or replace function public.user_assigned_to_patient(target_patient_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.patient_provider_assignments ppa
    where ppa.patient_id = target_patient_id
      and ppa.provider_id = auth.uid()
  );
$$;

create or replace function public.user_in_thread(target_thread_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.message_threads mt
    where mt.id = target_thread_id
      and (mt.patient_id = auth.uid() or mt.provider_id = auth.uid())
  );
$$;

alter table public.profiles enable row level security;
alter table public.patient_provider_assignments enable row level security;
alter table public.onboarding_records enable row level security;
alter table public.biomarker_entries enable row level security;
alter table public.glucose_readings enable row level security;
alter table public.food_logs enable row level security;
alter table public.medications enable row level security;
alter table public.medication_logs enable row level security;
alter table public.appointments enable row level security;
alter table public.message_threads enable row level security;
alter table public.messages enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (
  id = auth.uid() or public.user_assigned_to_patient(id)
);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
for insert with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists assignments_select on public.patient_provider_assignments;
create policy assignments_select on public.patient_provider_assignments
for select using (patient_id = auth.uid() or provider_id = auth.uid());

drop policy if exists assignments_insert on public.patient_provider_assignments;
create policy assignments_insert on public.patient_provider_assignments
for insert with check (provider_id = auth.uid());

drop policy if exists onboarding_select on public.onboarding_records;
create policy onboarding_select on public.onboarding_records
for select using (
  patient_id = auth.uid() or public.user_assigned_to_patient(patient_id)
);

drop policy if exists onboarding_mutate on public.onboarding_records;
create policy onboarding_mutate on public.onboarding_records
for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists biomarker_select on public.biomarker_entries;
create policy biomarker_select on public.biomarker_entries
for select using (
  patient_id = auth.uid() or public.user_assigned_to_patient(patient_id)
);

drop policy if exists biomarker_mutate on public.biomarker_entries;
create policy biomarker_mutate on public.biomarker_entries
for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists glucose_select on public.glucose_readings;
create policy glucose_select on public.glucose_readings
for select using (
  patient_id = auth.uid() or public.user_assigned_to_patient(patient_id)
);

drop policy if exists glucose_mutate on public.glucose_readings;
create policy glucose_mutate on public.glucose_readings
for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists food_select on public.food_logs;
create policy food_select on public.food_logs
for select using (
  patient_id = auth.uid() or public.user_assigned_to_patient(patient_id)
);

drop policy if exists food_mutate on public.food_logs;
create policy food_mutate on public.food_logs
for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists medications_select on public.medications;
create policy medications_select on public.medications
for select using (
  patient_id = auth.uid() or public.user_assigned_to_patient(patient_id)
);

drop policy if exists medications_mutate on public.medications;
create policy medications_mutate on public.medications
for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists med_logs_select on public.medication_logs;
create policy med_logs_select on public.medication_logs
for select using (
  patient_id = auth.uid() or public.user_assigned_to_patient(patient_id)
);

drop policy if exists med_logs_mutate on public.medication_logs;
create policy med_logs_mutate on public.medication_logs
for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists appointments_select on public.appointments;
create policy appointments_select on public.appointments
for select using (patient_id = auth.uid() or provider_id = auth.uid());

drop policy if exists appointments_insert on public.appointments;
create policy appointments_insert on public.appointments
for insert with check (
  patient_id = auth.uid()
  and exists (
    select 1
    from public.patient_provider_assignments ppa
    where ppa.patient_id = appointments.patient_id
      and ppa.provider_id = appointments.provider_id
  )
);

drop policy if exists appointments_update on public.appointments;
create policy appointments_update on public.appointments
for update using (patient_id = auth.uid() or provider_id = auth.uid())
with check (patient_id = auth.uid() or provider_id = auth.uid());

drop policy if exists threads_select on public.message_threads;
create policy threads_select on public.message_threads
for select using (patient_id = auth.uid() or provider_id = auth.uid());

drop policy if exists threads_insert on public.message_threads;
create policy threads_insert on public.message_threads
for insert with check (patient_id = auth.uid() or provider_id = auth.uid());

drop policy if exists threads_update on public.message_threads;
create policy threads_update on public.message_threads
for update using (patient_id = auth.uid() or provider_id = auth.uid())
with check (patient_id = auth.uid() or provider_id = auth.uid());

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
for select using (public.user_in_thread(thread_id));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
for insert with check (
  sender_id = auth.uid()
  and public.user_in_thread(thread_id)
);
