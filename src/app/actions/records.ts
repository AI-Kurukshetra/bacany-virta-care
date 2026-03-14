"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAssignedProviderId, requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const glucoseSchema = z.object({
  value_mg_dl: z.coerce.number().min(40).max(500),
  reading_context: z.enum(["fasting", "pre_meal", "post_meal", "bedtime"]),
  recorded_at: z.string().min(1),
});

const foodSchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  estimated_carbs: z.coerce.number().min(0).max(500),
  notes: z.string().min(2).max(400),
  logged_at: z.string().min(1),
});

const medicationSchema = z.object({
  name: z.string().min(2).max(80),
  dosage: z.string().min(1).max(80),
  frequency: z.string().min(2).max(80),
});

const medicationLogSchema = z.object({
  medication_id: z.string().uuid(),
  status: z.enum(["taken", "missed"]),
  logged_at: z.string().min(1),
});

const appointmentSchema = z.object({
  starts_at: z.string().min(1),
  reason: z.string().min(3).max(240),
});

const messageSchema = z.object({
  body: z.string().min(1).max(1200),
});

const onboardingSchema = z.object({
  current_weight_kg: z.coerce.number().min(30).max(300),
  baseline_hba1c: z.coerce.number().min(4).max(18),
  primary_goal: z.string().min(3).max(200),
  dietary_preference: z.string().min(3).max(100),
  activity_level: z.enum(["low", "moderate", "high"]),
});

function buildRedirect(path: string, error: string) {
  const params = new URLSearchParams();
  params.set("error", error);
  return `${path}?${params.toString()}`;
}

function buildMessagesRedirect(error: string, threadId?: string) {
  const params = new URLSearchParams();
  params.set("error", error);
  if (threadId) {
    params.set("thread", threadId);
  }
  return `/messages?${params.toString()}`;
}

export async function completeOnboarding(formData: FormData) {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();

  const parsed = onboardingSchema.parse({
    current_weight_kg: formData.get("current_weight_kg"),
    baseline_hba1c: formData.get("baseline_hba1c"),
    primary_goal: formData.get("primary_goal"),
    dietary_preference: formData.get("dietary_preference"),
    activity_level: formData.get("activity_level"),
  });

  await supabase.from("onboarding_records").upsert(
    {
      patient_id: profile.id,
      questionnaire: {
        dietary_preference: parsed.dietary_preference,
        activity_level: parsed.activity_level,
      },
      current_weight_kg: parsed.current_weight_kg,
      baseline_hba1c: parsed.baseline_hba1c,
      primary_goal: parsed.primary_goal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "patient_id" },
  );

  await supabase.from("biomarker_entries").insert([
    {
      patient_id: profile.id,
      metric_type: "weight_kg",
      value: parsed.current_weight_kg,
      unit: "kg",
      measured_at: new Date().toISOString(),
    },
    {
      patient_id: profile.id,
      metric_type: "hba1c",
      value: parsed.baseline_hba1c,
      unit: "%",
      measured_at: new Date().toISOString(),
    },
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}

export async function addGlucoseReading(formData: FormData) {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();
  const parsed = glucoseSchema.parse({
    value_mg_dl: formData.get("value_mg_dl"),
    reading_context: formData.get("reading_context"),
    recorded_at: formData.get("recorded_at"),
  });

  await supabase.from("glucose_readings").insert({
    patient_id: profile.id,
    value_mg_dl: parsed.value_mg_dl,
    reading_context: parsed.reading_context,
    recorded_at: new Date(parsed.recorded_at).toISOString(),
  });

  revalidatePath("/glucose");
  revalidatePath("/dashboard");
}

export async function addFoodLog(formData: FormData) {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();
  const parsed = foodSchema.parse({
    meal_type: formData.get("meal_type"),
    estimated_carbs: formData.get("estimated_carbs"),
    notes: formData.get("notes"),
    logged_at: formData.get("logged_at"),
  });

  await supabase.from("food_logs").insert({
    patient_id: profile.id,
    meal_type: parsed.meal_type,
    estimated_carbs: parsed.estimated_carbs,
    notes: parsed.notes,
    logged_at: new Date(parsed.logged_at).toISOString(),
  });

  revalidatePath("/nutrition");
}

export async function addMedication(formData: FormData) {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();
  const parsed = medicationSchema.parse({
    name: formData.get("name"),
    dosage: formData.get("dosage"),
    frequency: formData.get("frequency"),
  });

  await supabase.from("medications").insert({
    patient_id: profile.id,
    name: parsed.name,
    dosage: parsed.dosage,
    frequency: parsed.frequency,
    is_active: true,
  });

  revalidatePath("/medications");
  revalidatePath("/dashboard");
}

export async function addMedicationLog(formData: FormData) {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();
  const parsed = medicationLogSchema.parse({
    medication_id: formData.get("medication_id"),
    status: formData.get("status"),
    logged_at: formData.get("logged_at"),
  });

  await supabase.from("medication_logs").insert({
    patient_id: profile.id,
    medication_id: parsed.medication_id,
    status: parsed.status,
    logged_at: new Date(parsed.logged_at).toISOString(),
  });

  revalidatePath("/medications");
  revalidatePath("/dashboard");
}

export async function addAppointment(formData: FormData) {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();
  const parsed = appointmentSchema.parse({
    starts_at: formData.get("starts_at"),
    reason: formData.get("reason"),
  });

  const providerId = await getAssignedProviderId(profile.id);
  if (!providerId) {
    redirect(
      buildRedirect(
        "/appointments",
        "No provider assigned yet. Ask your care team to link your account.",
      ),
    );
  }

  await supabase.from("appointments").insert({
    patient_id: profile.id,
    provider_id: providerId,
    starts_at: new Date(parsed.starts_at).toISOString(),
    status: "requested",
    reason: parsed.reason,
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
}

export async function sendMessage(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createServerSupabaseClient();
  const parsed = messageSchema.parse({ body: formData.get("body") });

  let threadId = String(formData.get("thread_id") ?? "");
  if (!threadId) {
    if (profile.role === "patient") {
      const providerId = await getAssignedProviderId(profile.id);
      if (!providerId) {
        redirect(
          buildMessagesRedirect(
            "No provider assigned yet. Messaging unlocks once a provider is linked.",
          ),
        );
      }

      const existingThread = await supabase
        .from("message_threads")
        .select("id")
        .eq("patient_id", profile.id)
        .eq("provider_id", providerId)
        .maybeSingle<{ id: string }>();

      if (existingThread.error) {
        redirect(
          buildMessagesRedirect(
            `Unable to load your care thread: ${existingThread.error.message}`,
          ),
        );
      }

      if (existingThread.data?.id) {
        threadId = existingThread.data.id;
      } else {
        const threadInsert = await supabase
          .from("message_threads")
          .insert({
            patient_id: profile.id,
            provider_id: providerId,
          })
          .select("id")
          .single();

        if (threadInsert.error) {
          const duplicateThread = await supabase
            .from("message_threads")
            .select("id")
            .eq("patient_id", profile.id)
            .eq("provider_id", providerId)
            .maybeSingle<{ id: string }>();

          if (duplicateThread.data?.id) {
            threadId = duplicateThread.data.id;
          } else {
            redirect(
              buildMessagesRedirect(
                `Unable to create message thread: ${threadInsert.error.message}`,
              ),
            );
          }
        } else if (threadInsert.data?.id) {
          threadId = threadInsert.data.id as string;
        }
      }

      if (!threadId) {
        redirect(buildMessagesRedirect("Unable to open a message thread."));
      }
    } else {
      redirect(
        buildMessagesRedirect(
          "Select a patient thread before sending a provider message.",
        ),
      );
    }
  }

  const messageInsert = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: profile.id,
    body: parsed.body,
    sent_at: new Date().toISOString(),
  });

  if (messageInsert.error) {
    redirect(
      buildMessagesRedirect(
        `Unable to send message: ${messageInsert.error.message}`,
        threadId,
      ),
    );
  }

  const threadUpdate = await supabase
    .from("message_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  if (threadUpdate.error) {
    redirect(
      buildMessagesRedirect(
        `Message sent, but thread refresh failed: ${threadUpdate.error.message}`,
        threadId,
      ),
    );
  }

  revalidatePath("/messages");
  revalidatePath("/dashboard");
}
