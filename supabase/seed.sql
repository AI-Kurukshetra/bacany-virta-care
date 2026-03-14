-- Demo credentials
-- Password for all demo users: Test@123
-- Providers:
--   provider1@virtacare.app
--   provider2@virtacare.app
-- Patients:
--   patient1@virtacare.app
--   patient2@virtacare.app
--   patient3@virtacare.app

do $$
declare
  v_provider_1_id constant uuid := '11111111-1111-4111-8111-111111111111';
  v_provider_2_id constant uuid := '11111111-1111-4111-8111-111111111112';
  v_patient_1_id constant uuid := '22222222-2222-4222-8222-222222222221';
  v_patient_2_id constant uuid := '22222222-2222-4222-8222-222222222222';
  v_patient_3_id constant uuid := '22222222-2222-4222-8222-222222222223';

  v_thread_1_id constant uuid := '55555555-5555-4555-8555-555555555551';
  v_thread_2_id constant uuid := '55555555-5555-4555-8555-555555555552';
  v_thread_3_id constant uuid := '55555555-5555-4555-8555-555555555553';
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
    v_provider_1_id,
    'authenticated',
    'authenticated',
    'provider1@virtacare.app',
    crypt('Test@123', gen_salt('bf')),
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
    v_provider_2_id,
    'authenticated',
    'authenticated',
    'provider2@virtacare.app',
    crypt('Test@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Arjun Mehta","role":"provider"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    v_patient_1_id,
    'authenticated',
    'authenticated',
    'patient1@virtacare.app',
    crypt('Test@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Maya Johnson","role":"patient"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    v_patient_2_id,
    'authenticated',
    'authenticated',
    'patient2@virtacare.app',
    crypt('Test@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carlos Rivera","role":"patient"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    v_patient_3_id,
    'authenticated',
    'authenticated',
    'patient3@virtacare.app',
    crypt('Test@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Asha Patel","role":"patient"}'::jsonb,
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
    v_provider_1_id,
    jsonb_build_object('sub', v_provider_1_id::text, 'email', 'provider1@virtacare.app'),
    'email',
    'provider1@virtacare.app',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    v_provider_2_id,
    jsonb_build_object('sub', v_provider_2_id::text, 'email', 'provider2@virtacare.app'),
    'email',
    'provider2@virtacare.app',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    v_patient_1_id,
    jsonb_build_object('sub', v_patient_1_id::text, 'email', 'patient1@virtacare.app'),
    'email',
    'patient1@virtacare.app',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    v_patient_2_id,
    jsonb_build_object('sub', v_patient_2_id::text, 'email', 'patient2@virtacare.app'),
    'email',
    'patient2@virtacare.app',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    v_patient_3_id,
    jsonb_build_object('sub', v_patient_3_id::text, 'email', 'patient3@virtacare.app'),
    'email',
    'patient3@virtacare.app',
    now(),
    now()
  )
  on conflict (provider, provider_id) do nothing;

  insert into public.profiles (id, role, full_name, timezone)
  values
    (v_provider_1_id, 'provider', 'Dr. Elena Carter', 'America/New_York'),
    (v_provider_2_id, 'provider', 'Dr. Arjun Mehta', 'Asia/Kolkata'),
    (v_patient_1_id, 'patient', 'Maya Johnson', 'America/New_York'),
    (v_patient_2_id, 'patient', 'Carlos Rivera', 'America/Chicago'),
    (v_patient_3_id, 'patient', 'Asha Patel', 'Asia/Kolkata')
  on conflict (id) do update
  set role = excluded.role,
      full_name = excluded.full_name,
      timezone = excluded.timezone;

  insert into public.patient_provider_assignments (patient_id, provider_id)
  values
    (v_patient_1_id, v_provider_1_id),
    (v_patient_2_id, v_provider_1_id),
    (v_patient_3_id, v_provider_2_id)
  on conflict (patient_id, provider_id) do nothing;

  insert into public.onboarding_records (
    patient_id,
    questionnaire,
    current_weight_kg,
    baseline_hba1c,
    primary_goal
  )
  values
    (
      v_patient_1_id,
      '{"dietary_preference":"Low-carb Mediterranean","activity_level":"moderate"}'::jsonb,
      84.2,
      6.9,
      'Reach HbA1c below 6.5 and improve fasting consistency.'
    ),
    (
      v_patient_2_id,
      '{"dietary_preference":"Balanced high-fiber","activity_level":"low"}'::jsonb,
      96.4,
      8.1,
      'Reduce post-meal glucose spikes and lose 6 kg in 4 months.'
    ),
    (
      v_patient_3_id,
      '{"dietary_preference":"Vegetarian high-protein","activity_level":"high"}'::jsonb,
      68.7,
      7.2,
      'Improve insulin sensitivity and maintain stable evening glucose.'
    )
  on conflict (patient_id) do update
  set questionnaire = excluded.questionnaire,
      current_weight_kg = excluded.current_weight_kg,
      baseline_hba1c = excluded.baseline_hba1c,
      primary_goal = excluded.primary_goal,
      updated_at = now();

  delete from public.medication_logs
  where patient_id in (v_patient_1_id, v_patient_2_id, v_patient_3_id);

  delete from public.food_logs
  where patient_id in (v_patient_1_id, v_patient_2_id, v_patient_3_id);

  delete from public.glucose_readings
  where patient_id in (v_patient_1_id, v_patient_2_id, v_patient_3_id);

  delete from public.biomarker_entries
  where patient_id in (v_patient_1_id, v_patient_2_id, v_patient_3_id);

  delete from public.messages
  where thread_id in (v_thread_1_id, v_thread_2_id, v_thread_3_id);

  delete from public.message_threads
  where id in (v_thread_1_id, v_thread_2_id, v_thread_3_id);

  delete from public.appointments
  where id in (
    '66666666-6666-4666-8666-666666666661'::uuid,
    '66666666-6666-4666-8666-666666666662'::uuid,
    '66666666-6666-4666-8666-666666666663'::uuid,
    '66666666-6666-4666-8666-666666666664'::uuid,
    '66666666-6666-4666-8666-666666666665'::uuid,
    '66666666-6666-4666-8666-666666666666'::uuid
  );

  insert into public.medications (id, patient_id, name, dosage, frequency, is_active)
  values
    ('33333333-3333-4333-8333-333333333331', v_patient_1_id, 'Metformin', '500 mg', 'Twice daily', true),
    ('33333333-3333-4333-8333-333333333332', v_patient_1_id, 'Semaglutide', '0.5 mg', 'Weekly', true),
    ('33333333-3333-4333-8333-333333333333', v_patient_2_id, 'Metformin XR', '1000 mg', 'Nightly', true),
    ('33333333-3333-4333-8333-333333333334', v_patient_2_id, 'Empagliflozin', '10 mg', 'Daily (morning)', true),
    ('33333333-3333-4333-8333-333333333335', v_patient_3_id, 'Metformin', '500 mg', 'Twice daily', true),
    ('33333333-3333-4333-8333-333333333336', v_patient_3_id, 'Pioglitazone', '15 mg', 'Daily', false)
  on conflict (id) do update
  set name = excluded.name,
      dosage = excluded.dosage,
      frequency = excluded.frequency,
      is_active = excluded.is_active,
      updated_at = now();

  insert into public.biomarker_entries (patient_id, metric_type, value, unit, measured_at)
  values
    (v_patient_1_id, 'hba1c', 8.2, '%', now() - interval '120 days'),
    (v_patient_1_id, 'hba1c', 7.4, '%', now() - interval '60 days'),
    (v_patient_1_id, 'hba1c', 6.9, '%', now() - interval '10 days'),
    (v_patient_1_id, 'weight_kg', 88.4, 'kg', now() - interval '120 days'),
    (v_patient_1_id, 'weight_kg', 85.7, 'kg', now() - interval '45 days'),
    (v_patient_1_id, 'weight_kg', 84.2, 'kg', now() - interval '1 day'),
    (v_patient_1_id, 'blood_pressure_sys', 128, 'mmHg', now() - interval '6 days'),
    (v_patient_1_id, 'blood_pressure_dia', 82, 'mmHg', now() - interval '6 days'),

    (v_patient_2_id, 'hba1c', 9.0, '%', now() - interval '120 days'),
    (v_patient_2_id, 'hba1c', 8.6, '%', now() - interval '60 days'),
    (v_patient_2_id, 'hba1c', 8.1, '%', now() - interval '7 days'),
    (v_patient_2_id, 'weight_kg', 99.8, 'kg', now() - interval '120 days'),
    (v_patient_2_id, 'weight_kg', 97.5, 'kg', now() - interval '60 days'),
    (v_patient_2_id, 'weight_kg', 96.4, 'kg', now() - interval '2 days'),
    (v_patient_2_id, 'blood_pressure_sys', 136, 'mmHg', now() - interval '4 days'),
    (v_patient_2_id, 'blood_pressure_dia', 88, 'mmHg', now() - interval '4 days'),

    (v_patient_3_id, 'hba1c', 7.9, '%', now() - interval '90 days'),
    (v_patient_3_id, 'hba1c', 7.2, '%', now() - interval '5 days'),
    (v_patient_3_id, 'weight_kg', 70.2, 'kg', now() - interval '90 days'),
    (v_patient_3_id, 'weight_kg', 68.7, 'kg', now() - interval '1 day'),
    (v_patient_3_id, 'blood_pressure_sys', 122, 'mmHg', now() - interval '3 days'),
    (v_patient_3_id, 'blood_pressure_dia', 78, 'mmHg', now() - interval '3 days');

  with demo_patients as (
    select *
    from (
      values
        (v_patient_1_id, 98, 34),
        (v_patient_2_id, 112, 60),
        (v_patient_3_id, 94, 30)
    ) as t(patient_id, base_value, variability)
  )
  insert into public.glucose_readings (patient_id, value_mg_dl, reading_context, recorded_at)
  select
    dp.patient_id,
    greatest(
      70,
      least(
        280,
        dp.base_value
        + ((day_idx * 7 + context_idx * 11) % dp.variability)
        + case when context_name = 'post_meal' then 26 else 0 end
      )
    )::int,
    context_name::reading_context,
    date_trunc('day', now()) - (day_idx || ' days')::interval + (context_idx * interval '4 hours')
  from demo_patients dp
  cross join generate_series(0, 20) as day_idx
  cross join (
    values
      (0, 'fasting'),
      (1, 'pre_meal'),
      (2, 'post_meal'),
      (3, 'bedtime')
  ) as contexts(context_idx, context_name);

  with demo_patients as (
    select *
    from (
      values
        (v_patient_1_id, 'Greek yogurt bowl with chia and berries'::text),
        (v_patient_2_id, 'Brown rice, dal, salad and grilled paneer'::text),
        (v_patient_3_id, 'Tofu stir-fry with quinoa and sauteed greens'::text)
    ) as t(patient_id, base_note)
  )
  insert into public.food_logs (patient_id, meal_type, notes, estimated_carbs, logged_at)
  select
    dp.patient_id,
    case meal_idx % 4
      when 0 then 'breakfast'::meal_type
      when 1 then 'lunch'::meal_type
      when 2 then 'dinner'::meal_type
      else 'snack'::meal_type
    end,
    case meal_idx % 4
      when 0 then concat(dp.base_note, ' + black coffee')
      when 1 then concat(dp.base_note, ' + cucumber salad')
      when 2 then concat(dp.base_note, ' + sauteed vegetables')
      else 'Roasted nuts and buttermilk'
    end,
    14 + ((meal_idx * 9) % 34),
    now() - (meal_idx || ' days')::interval
  from demo_patients dp
  cross join generate_series(0, 24) as meal_idx;

  with medication_map as (
    select *
    from (
      values
        (v_patient_1_id, '33333333-3333-4333-8333-333333333331'::uuid, '33333333-3333-4333-8333-333333333332'::uuid),
        (v_patient_2_id, '33333333-3333-4333-8333-333333333333'::uuid, '33333333-3333-4333-8333-333333333334'::uuid),
        (v_patient_3_id, '33333333-3333-4333-8333-333333333335'::uuid, '33333333-3333-4333-8333-333333333336'::uuid)
    ) as t(patient_id, medication_a, medication_b)
  )
  insert into public.medication_logs (patient_id, medication_id, status, logged_at)
  select
    mm.patient_id,
    case when day_idx % 2 = 0 then mm.medication_a else mm.medication_b end,
    case when day_idx % 8 = 0 then 'missed'::med_log_status else 'taken'::med_log_status end,
    now() - (day_idx || ' days')::interval
  from medication_map mm
  cross join generate_series(0, 20) as day_idx;

  insert into public.appointments (id, patient_id, provider_id, starts_at, status, reason)
  values
    (
      '66666666-6666-4666-8666-666666666661',
      v_patient_1_id,
      v_provider_1_id,
      now() + interval '2 days',
      'confirmed',
      'Weekly metabolic progress review'
    ),
    (
      '66666666-6666-4666-8666-666666666662',
      v_patient_1_id,
      v_provider_1_id,
      now() - interval '8 days',
      'completed',
      'Medication and onboarding follow-up'
    ),
    (
      '66666666-6666-4666-8666-666666666663',
      v_patient_2_id,
      v_provider_1_id,
      now() + interval '1 day',
      'requested',
      'Review post-meal glucose spikes'
    ),
    (
      '66666666-6666-4666-8666-666666666664',
      v_patient_2_id,
      v_provider_1_id,
      now() + interval '6 days',
      'confirmed',
      'Nutrition strategy adjustment'
    ),
    (
      '66666666-6666-4666-8666-666666666665',
      v_patient_3_id,
      v_provider_2_id,
      now() + interval '3 days',
      'confirmed',
      'Exercise and sleep quality check-in'
    ),
    (
      '66666666-6666-4666-8666-666666666666',
      v_patient_3_id,
      v_provider_2_id,
      now() - interval '5 days',
      'completed',
      'Initial consult and care plan setup'
    )
  on conflict (id) do update
  set starts_at = excluded.starts_at,
      status = excluded.status,
      reason = excluded.reason;

  insert into public.message_threads (id, patient_id, provider_id, updated_at)
  values
    (v_thread_1_id, v_patient_1_id, v_provider_1_id, now() - interval '2 hours'),
    (v_thread_2_id, v_patient_2_id, v_provider_1_id, now() - interval '5 hours'),
    (v_thread_3_id, v_patient_3_id, v_provider_2_id, now() - interval '1 hour')
  on conflict (id) do update
  set updated_at = excluded.updated_at;

  insert into public.messages (thread_id, sender_id, body, sent_at)
  values
    (
      v_thread_1_id,
      v_provider_1_id,
      'Your fasting trend is improving. Keep your evening carbs under 25g this week.',
      now() - interval '2 days'
    ),
    (
      v_thread_1_id,
      v_patient_1_id,
      'Noted. I also started a 20-minute walk after dinner.',
      now() - interval '1 day 20 hours'
    ),
    (
      v_thread_1_id,
      v_provider_1_id,
      'Great. Please log bedtime glucose for the next 5 days.',
      now() - interval '2 hours'
    ),

    (
      v_thread_2_id,
      v_patient_2_id,
      'Post-lunch values still spike above 180 on some days.',
      now() - interval '9 hours'
    ),
    (
      v_thread_2_id,
      v_provider_1_id,
      'Let us reduce refined carbs at lunch and recheck after 1 week.',
      now() - interval '5 hours'
    ),

    (
      v_thread_3_id,
      v_provider_2_id,
      'Great consistency this week. How are your energy levels?',
      now() - interval '3 hours'
    ),
    (
      v_thread_3_id,
      v_patient_3_id,
      'Energy is much better. Evening cravings are also down.',
      now() - interval '1 hour'
    );
end $$;
