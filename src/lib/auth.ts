import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
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
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

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

  const { error } = await supabase.from("profiles").insert(insertPayload);
  if (error) {
    throw new Error(`Unable to create profile: ${error.message}`);
  }

  const { data: createdProfile, error: createdProfileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (createdProfileError || !createdProfile) {
    throw new Error("Profile creation completed but profile could not be read.");
  }

  return createdProfile;
}

export async function requireProfile(requiredRole?: UserRole): Promise<Profile> {
  const user = await requireUser();
  const profile = await ensureProfile(user);

  if (requiredRole && profile.role !== requiredRole) {
    redirect("/dashboard");
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
    .maybeSingle<{ provider_id: string }>();

  return data?.provider_id ?? null;
}

