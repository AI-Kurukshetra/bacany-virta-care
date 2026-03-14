import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseAdminEnv } from "@/lib/env";
import {
  assignDefaultProvider,
  ensureProviderDemoData,
} from "@/lib/provider-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

type UserMetadata = {
  full_name?: string;
  role?: string;
};

function toRole(value: string | undefined): UserRole {
  return value === "provider" ? "provider" : "patient";
}

function deriveName(user: User): string {
  const metadata = user.user_metadata as UserMetadata;
  if (metadata.full_name) {
    return metadata.full_name;
  }

  if (user.email) {
    return user.email.split("@")[0].replace(/[._-]/g, " ");
  }

  return "bacancy-vitra-care user";
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

async function ensureProfile(user: User): Promise<Profile> {
  const supabase = await createServerSupabaseClient();
  const readProfile = async (): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (error) {
      throw new Error(`Unable to read profile: ${error.message}`);
    }

    return data;
  };

  const profile = await readProfile();
  if (profile) {
    return profile;
  }

  const metadata = user.user_metadata as UserMetadata;
  const insertPayload = {
    id: user.id,
    role: toRole(metadata.role),
    full_name: deriveName(user),
    timezone: "America/New_York",
  };

  const { data: upsertedProfile, error: upsertError } = await supabase
    .from("profiles")
    .upsert(insertPayload, { onConflict: "id" })
    .select("*")
    .maybeSingle<Profile>();

  if (upsertError) {
    throw new Error(`Unable to create profile: ${upsertError.message}`);
  }

  if (upsertedProfile) {
    return upsertedProfile;
  }

  for (const delayMs of [50, 100, 200]) {
    const createdProfile = await readProfile();
    if (createdProfile) {
      return createdProfile;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const now = new Date().toISOString();
  return {
    id: user.id,
    role: insertPayload.role,
    full_name: insertPayload.full_name,
    avatar_url: null,
    timezone: insertPayload.timezone,
    created_at: now,
    updated_at: now,
  };
}

export async function requireProfile(requiredRole?: UserRole): Promise<Profile> {
  const user = await requireUser();
  const profile = await ensureProfile(user);

  if (requiredRole && profile.role !== requiredRole) {
    redirect("/dashboard");
  }

  if (
    profile.role === "provider" &&
    hasSupabaseAdminEnv() &&
    process.env.NODE_ENV !== "production"
  ) {
    await ensureProviderDemoData(profile.id);
  }

  return profile;
}

export async function getAssignedProviderId(
  patientId: string,
): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("patient_provider_assignments")
    .select("provider_id")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ provider_id: string }>();

  if (data?.provider_id) {
    return data.provider_id;
  }

  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  return assignDefaultProvider(patientId);
}

