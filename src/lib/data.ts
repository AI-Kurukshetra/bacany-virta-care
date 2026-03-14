import { subDays } from "@/lib/date";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Appointment,
  BiomarkerEntry,
  FoodLog,
  GlucoseReading,
  Medication,
  MedicationLog,
  Message,
  MessageThread,
  Profile,
} from "@/lib/types";

export type PatientDashboardData = {
  glucose: GlucoseReading[];
  biomarkers: BiomarkerEntry[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  nextAppointment: Appointment | null;
  latestMessage: Message | null;
};

export type ProviderDashboardData = {
  patients: Profile[];
  appointments: Appointment[];
  unreadMessages: number;
  highRiskPatients: number;
};

export async function getPatientDashboardData(
  patientId: string,
): Promise<PatientDashboardData> {
  const supabase = await createServerSupabaseClient();
  const weekAgo = subDays(new Date(), 7).toISOString();

  const [
    glucoseResult,
    biomarkerResult,
    medicationsResult,
    medicationLogsResult,
    appointmentResult,
    threadResult,
  ] = await Promise.all([
    supabase
      .from("glucose_readings")
      .select("*")
      .eq("patient_id", patientId)
      .gte("recorded_at", weekAgo)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("biomarker_entries")
      .select("*")
      .eq("patient_id", patientId)
      .order("measured_at", { ascending: false })
      .limit(10),
    supabase
      .from("medications")
      .select("*")
      .eq("patient_id", patientId)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("medication_logs")
      .select("*")
      .eq("patient_id", patientId)
      .gte("logged_at", weekAgo)
      .order("logged_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("message_threads")
      .select("id")
      .eq("patient_id", patientId)
      .maybeSingle<{ id: string }>(),
  ]);

  let latestMessage: Message | null = null;
  if (threadResult.data?.id) {
    const messageResult = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadResult.data.id)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    latestMessage = (messageResult.data as Message | null) ?? null;
  }

  return {
    glucose: (glucoseResult.data as GlucoseReading[]) ?? [],
    biomarkers: (biomarkerResult.data as BiomarkerEntry[]) ?? [],
    medications: (medicationsResult.data as Medication[]) ?? [],
    medicationLogs: (medicationLogsResult.data as MedicationLog[]) ?? [],
    nextAppointment: (appointmentResult.data as Appointment | null) ?? null,
    latestMessage,
  };
}

export async function getProviderDashboardData(
  providerId: string,
): Promise<ProviderDashboardData> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const assignmentsResult = await supabase
    .from("patient_provider_assignments")
    .select("patient_id")
    .eq("provider_id", providerId);

  const patientIds =
    assignmentsResult.data?.map((row) => row.patient_id as string) ?? [];

  if (patientIds.length === 0) {
    return {
      patients: [],
      appointments: [],
      unreadMessages: 0,
      highRiskPatients: 0,
    };
  }

  const [patientsResult, appointmentsResult, recentGlucoseResult, threadsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").in("id", patientIds),
      supabase
        .from("appointments")
        .select("*")
        .eq("provider_id", providerId)
        .gte("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(10),
      supabase
        .from("glucose_readings")
        .select("patient_id,value_mg_dl,recorded_at")
        .in("patient_id", patientIds)
        .gte("recorded_at", subDays(new Date(), 3).toISOString()),
      supabase
        .from("message_threads")
        .select("id,updated_at")
        .eq("provider_id", providerId),
    ]);

  const highRiskPatients = new Set(
    (recentGlucoseResult.data ?? [])
      .filter((row) => Number(row.value_mg_dl) >= 180)
      .map((row) => row.patient_id as string),
  ).size;

  let unreadMessages = 0;
  const threads = threadsResult.data ?? [];
  if (threads.length > 0) {
    const threadIds = threads.map((thread) => thread.id as string);
    const messagesResult = await supabase
      .from("messages")
      .select("thread_id,sender_id")
      .in("thread_id", threadIds)
      .limit(200);

    unreadMessages = (messagesResult.data ?? []).filter(
      (message) => message.sender_id !== providerId,
    ).length;
  }

  return {
    patients: (patientsResult.data as Profile[]) ?? [],
    appointments: (appointmentsResult.data as Appointment[]) ?? [],
    unreadMessages,
    highRiskPatients,
  };
}

export async function getPatientDeepView(patientId: string) {
  const supabase = await createServerSupabaseClient();

  const [profileResult, glucoseResult, biomarkerResult, foodResult, medsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", patientId).maybeSingle(),
      supabase
        .from("glucose_readings")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(30),
      supabase
        .from("biomarker_entries")
        .select("*")
        .eq("patient_id", patientId)
        .order("measured_at", { ascending: false })
        .limit(20),
      supabase
        .from("food_logs")
        .select("*")
        .eq("patient_id", patientId)
        .order("logged_at", { ascending: false })
        .limit(20),
      supabase
        .from("medications")
        .select("*")
        .eq("patient_id", patientId)
        .order("updated_at", { ascending: false }),
    ]);

  return {
    profile: (profileResult.data as Profile | null) ?? null,
    glucose: (glucoseResult.data as GlucoseReading[]) ?? [],
    biomarkers: (biomarkerResult.data as BiomarkerEntry[]) ?? [],
    food: (foodResult.data as FoodLog[]) ?? [],
    medications: (medsResult.data as Medication[]) ?? [],
  };
}

export async function getMessagesForViewer(profileId: string, role: string) {
  const supabase = await createServerSupabaseClient();
  const threadColumn = role === "provider" ? "provider_id" : "patient_id";

  const threadResult = await supabase
    .from("message_threads")
    .select("*")
    .eq(threadColumn, profileId)
    .maybeSingle();

  const thread = (threadResult.data as MessageThread | null) ?? null;
  if (!thread) {
    return { thread: null, messages: [] as Message[] };
  }

  const messagesResult = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", thread.id)
    .order("sent_at", { ascending: true });

  return {
    thread,
    messages: (messagesResult.data as Message[]) ?? [],
  };
}
