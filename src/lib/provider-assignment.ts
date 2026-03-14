import { createHash } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function assignDefaultProvider(
  patientId: string,
): Promise<string | null> {
  const adminSupabase = createAdminSupabaseClient();
  const { data: providers, error: providersError } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("role", "provider")
    .order("created_at", { ascending: true });

  if (providersError) {
    throw new Error(`Unable to load providers: ${providersError.message}`);
  }

  if (!providers || providers.length === 0) {
    return null;
  }

  const providerIds = providers.map((provider) => String(provider.id));
  const { data: assignments, error: assignmentsError } = await adminSupabase
    .from("patient_provider_assignments")
    .select("provider_id")
    .in("provider_id", providerIds);

  if (assignmentsError) {
    throw new Error(
      `Unable to load provider assignments: ${assignmentsError.message}`,
    );
  }

  const assignmentCounts = new Map<string, number>(
    providerIds.map((providerId) => [providerId, 0]),
  );
  for (const assignment of assignments ?? []) {
    const providerId = String(assignment.provider_id);
    assignmentCounts.set(providerId, (assignmentCounts.get(providerId) ?? 0) + 1);
  }

  const selectedProviderId = providerIds.reduce((currentBest, providerId) => {
    const currentBestCount = assignmentCounts.get(currentBest) ?? 0;
    const providerCount = assignmentCounts.get(providerId) ?? 0;
    return providerCount < currentBestCount ? providerId : currentBest;
  }, providerIds[0]);

  const { error: insertError } = await adminSupabase
    .from("patient_provider_assignments")
    .upsert(
      {
        patient_id: patientId,
        provider_id: selectedProviderId,
      },
      { onConflict: "patient_id,provider_id" },
    );

  if (insertError) {
    throw new Error(`Unable to assign provider: ${insertError.message}`);
  }

  return selectedProviderId;
}

type DemoPatientSeed = {
  id: string;
  futureOffsetDays: number;
  futureReason: string;
  introMessage: string;
  patientReply: string;
};

const providerDemoPatients: DemoPatientSeed[] = [
  {
    id: "22222222-2222-4222-8222-222222222221",
    futureOffsetDays: 2,
    futureReason: "Weekly glucose variability review",
    introMessage:
      "Welcome to your demo panel. Maya has trending improvement in fasting glucose this week.",
    patientReply:
      "I have been more consistent with evening walks and carb timing.",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    futureOffsetDays: 4,
    futureReason: "Post-meal spike review and meal planning",
    introMessage:
      "Carlos needs attention on lunch-time spikes and adherence follow-up.",
    patientReply:
      "Lunch is still my hardest meal to keep stable, especially on work days.",
  },
];

function deterministicUuid(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

export async function ensureProviderDemoData(providerId: string): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const adminSupabase = createAdminSupabaseClient();
  const { data: existingAssignments, error: assignmentsError } =
    await adminSupabase
      .from("patient_provider_assignments")
      .select("patient_id")
      .eq("provider_id", providerId)
      .limit(1);

  if (assignmentsError) {
    throw new Error(
      `Unable to inspect provider assignments: ${assignmentsError.message}`,
    );
  }

  if ((existingAssignments ?? []).length > 0) {
    return;
  }

  const { data: patients, error: patientsError } = await adminSupabase
    .from("profiles")
    .select("id")
    .in(
      "id",
      providerDemoPatients.map((patient) => patient.id),
    );

  if (patientsError) {
    throw new Error(`Unable to load demo patients: ${patientsError.message}`);
  }

  const availablePatientIds = new Set(
    (patients ?? []).map((patient) => String(patient.id)),
  );
  const selectedPatients = providerDemoPatients.filter((patient) =>
    availablePatientIds.has(patient.id),
  );

  if (selectedPatients.length === 0) {
    return;
  }

  const assignmentRows = selectedPatients.map((patient) => ({
    patient_id: patient.id,
    provider_id: providerId,
  }));

  const appointmentRows = selectedPatients.map((patient, index) => ({
    id: deterministicUuid(`${providerId}:${patient.id}:appointment:future`),
    patient_id: patient.id,
    provider_id: providerId,
    starts_at: new Date(
      Date.now() + patient.futureOffsetDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status: index % 2 === 0 ? "confirmed" : "requested",
    reason: patient.futureReason,
  }));

  const threadRows = selectedPatients.map((patient) => ({
    id: deterministicUuid(`${providerId}:${patient.id}:thread`),
    patient_id: patient.id,
    provider_id: providerId,
    updated_at: new Date().toISOString(),
  }));

  const messageRows = selectedPatients.flatMap((patient) => {
    const threadId = deterministicUuid(`${providerId}:${patient.id}:thread`);
    return [
      {
        id: deterministicUuid(`${threadId}:message:provider`),
        thread_id: threadId,
        sender_id: providerId,
        body: patient.introMessage,
        sent_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: deterministicUuid(`${threadId}:message:patient`),
        thread_id: threadId,
        sender_id: patient.id,
        body: patient.patientReply,
        sent_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
    ];
  });

  const { error: appointmentsError } = await adminSupabase
    .from("appointments")
    .upsert(appointmentRows, { onConflict: "id" });

  if (appointmentsError) {
    throw new Error(
      `Unable to seed provider appointments: ${appointmentsError.message}`,
    );
  }

  const { error: threadsError } = await adminSupabase
    .from("message_threads")
    .upsert(threadRows, { onConflict: "patient_id,provider_id" });

  if (threadsError) {
    throw new Error(`Unable to seed provider threads: ${threadsError.message}`);
  }

  const { error: messagesError } = await adminSupabase
    .from("messages")
    .upsert(messageRows, { onConflict: "id" });

  if (messagesError) {
    throw new Error(`Unable to seed provider messages: ${messagesError.message}`);
  }

  const { error: insertAssignmentsError } = await adminSupabase
    .from("patient_provider_assignments")
    .upsert(assignmentRows, { onConflict: "patient_id,provider_id" });

  if (insertAssignmentsError) {
    throw new Error(
      `Unable to seed provider assignments: ${insertAssignmentsError.message}`,
    );
  }
}
