-- Demo credentials
-- provider: demo.provider@virtacare.app / Password123!
-- patient: demo.patient@virtacare.app / Password123!

do $$
declare
  v_provider_id constant uuid := '11111111-1111-4111-8111-111111111111';
  v_patient_id constant uuid := '22222222-2222-4222-8222-222222222222';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values
  (
    '00000000-0000-0000-0000-000000000000',
    v_provider_id,
    'authenticated',
    'authenticated',
    'demo.provider@virtacare.app',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Elena Carter","role":"provider"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    v_patient_id,
    'authenticated',
    'authenticated',
    'demo.patient@virtacare.app',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Maya Johnson","role":"patient"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do nothing;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
  )
  values
  (
    gen_random_uuid(),
    v_provider_id,
    jsonb_build_object('sub', v_provider_id::text, 'email', 'demo.provider@virtacare.app'),
    'email',
    'demo.provider@virtacare.app',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    v_patient_id,
    jsonb_build_object('sub', v_patient_id::text, 'email', 'demo.patient@virtacare.app'),
    'email',
    'demo.patient@virtacare.app',
    now(),
    now()
  )
  on conflict (provider, provider_id) do nothing;

  insert into public.profiles (id, role, full_name, timezone)
  values
    (v_provider_id, 'provider', 'Dr. Elena Carter', 'America/New_York'),
    (v_patient_id, 'patient', 'Maya Johnson', 'America/New_York')
  on conflict (id) do update
  set role = excluded.role,
      full_name = excluded.full_name,
      timezone = excluded.timezone;

  insert into public.patient_provider_assignments (patient_id, provider_id)
  values (v_patient_id, v_provider_id)
  on conflict (patient_id, provider_id) do nothing;

  insert into public.onboarding_records (
    patient_id,
    questionnaire,
    current_weight_kg,
    baseline_hba1c,
    primary_goal
  )
  values (
    v_patient_id,
    '{"dietary_preference":"Low-carb Mediterranean", "activity_level":"moderate"}'::jsonb,
    84.2,
    8.3,
    'Reach HbA1c below 6.5 and improve fasting glucose consistency.'
  )
  on conflict (patient_id) do update
  set questionnaire = excluded.questionnaire,
      current_weight_kg = excluded.current_weight_kg,
      baseline_hba1c = excluded.baseline_hba1c,
      primary_goal = excluded.primary_goal,
      updated_at = now();

  insert into public.biomarker_entries (patient_id, metric_type, value, unit, measured_at)
  values
    (v_patient_id, 'hba1c', 8.3, '%', now() - interval '30 days'),
    (v_patient_id, 'hba1c', 7.5, '%', now() - interval '15 days'),
    (v_patient_id, 'hba1c', 6.9, '%', now() - interval '2 days'),
    (v_patient_id, 'weight_kg', 86.5, 'kg', now() - interval '30 days'),
    (v_patient_id, 'weight_kg', 85.1, 'kg', now() - interval '15 days'),
    (v_patient_id, 'weight_kg', 84.2, 'kg', now() - interval '1 day')
  on conflict do nothing;

  insert into public.medications (id, patient_id, name, dosage, frequency, is_active)
  values
    ('33333333-3333-4333-8333-333333333333', v_patient_id, 'Metformin', '500 mg', 'Twice daily', true),
    ('44444444-4444-4444-8444-444444444444', v_patient_id, 'Semaglutide', '0.5 mg', 'Weekly', true)
  on conflict (id) do update
  set name = excluded.name,
      dosage = excluded.dosage,
      frequency = excluded.frequency,
      is_active = excluded.is_active,
      updated_at = now();

  if not exists (select 1 from public.glucose_readings where patient_id = v_patient_id) then
    insert into public.glucose_readings (patient_id, value_mg_dl, reading_context, recorded_at)
    select
      v_patient_id,
      (
        95
        + ((day_idx * 5 + context_idx * 11) % 48)
        + case when context_name = 'post_meal' then 24 else 0 end
      )::int,
      context_name::reading_context,
      date_trunc('day', now()) - (day_idx || ' days')::interval + (context_idx * interval '4 hours')
    from generate_series(0, 29) as day_idx
    cross join (
      values
        (0, 'fasting'),
        (1, 'pre_meal'),
        (2, 'post_meal'),
        (3, 'bedtime')
    ) as contexts(context_idx, context_name);
  end if;

  if not exists (select 1 from public.food_logs where patient_id = v_patient_id) then
    insert into public.food_logs (patient_id, meal_type, notes, estimated_carbs, logged_at)
    select
      v_patient_id,
      case meal_idx % 4
        when 0 then 'breakfast'::meal_type
        when 1 then 'lunch'::meal_type
        when 2 then 'dinner'::meal_type
        else 'snack'::meal_type
      end,
      case meal_idx % 4
        when 0 then 'Greek yogurt, walnuts, berries'
        when 1 then 'Grilled chicken salad with avocado'
        when 2 then 'Salmon with roasted broccoli'
        else 'Cucumber slices with hummus'
      end,
      12 + ((meal_idx * 7) % 24),
      now() - (meal_idx || ' days')::interval
    from generate_series(0, 20) as meal_idx;
  end if;

  if not exists (select 1 from public.medication_logs where patient_id = v_patient_id) then
    insert into public.medication_logs (patient_id, medication_id, status, logged_at)
    select
      v_patient_id,
      case when day_idx % 2 = 0
        then '33333333-3333-4333-8333-333333333333'::uuid
        else '44444444-4444-4444-8444-444444444444'::uuid
      end,
      case when day_idx % 9 = 0 then 'missed'::med_log_status else 'taken'::med_log_status end,
      now() - (day_idx || ' days')::interval
    from generate_series(0, 20) as day_idx;
  end if;

  insert into public.appointments (id, patient_id, provider_id, starts_at, status, reason)
  values
    ('66666666-6666-4666-8666-666666666666', v_patient_id, v_provider_id, now() + interval '3 days', 'confirmed', 'Weekly metabolic review'),
    ('77777777-7777-4777-8777-777777777777', v_patient_id, v_provider_id, now() - interval '7 days', 'completed', 'Medication and nutrition check-in')
  on conflict (id) do update
  set starts_at = excluded.starts_at,
      status = excluded.status,
      reason = excluded.reason;

  insert into public.message_threads (id, patient_id, provider_id)
  values ('55555555-5555-4555-8555-555555555555', v_patient_id, v_provider_id)
  on conflict (id) do nothing;

  if not exists (
    select 1 from public.messages where thread_id = '55555555-5555-4555-8555-555555555555'::uuid
  ) then
    insert into public.messages (thread_id, sender_id, body, sent_at)
    values
      ('55555555-5555-4555-8555-555555555555', v_provider_id, 'Welcome to VirtaCare. Please share your fasting trend this week.', now() - interval '2 days'),
      ('55555555-5555-4555-8555-555555555555', v_patient_id, 'Average fasting was around 108 mg/dL, with post-dinner spikes.', now() - interval '1 day'),
      ('55555555-5555-4555-8555-555555555555', v_provider_id, 'Great progress. Let us reduce evening carbs by 10g for the next week.', now() - interval '4 hours');
  end if;
end $$;
