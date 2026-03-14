"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { assignDefaultProvider } from "@/lib/provider-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function buildRedirect(path: string, message: string, type: "error" | "success") {
  const params = new URLSearchParams();
  params.set(type, message);
  return `${path}?${params.toString()}`;
}

async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) {
    return origin;
  }

  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost ?? headerList.get("host");
  if (host) {
    const forwardedProto = headerList.get("x-forwarded-proto");
    const protocol =
      forwardedProto ??
      (host.includes("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");

    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

type SignUpRole = "patient" | "provider";

function toRole(value: string): SignUpRole {
  return value === "provider" ? "provider" : "patient";
}

function deriveName(fullName: string, email: string): string {
  if (fullName) {
    return fullName;
  }

  return email.split("@")[0].replace(/[._-]/g, " ");
}

async function bootstrapProfile(userId: string, role: SignUpRole, fullName: string) {
  const adminSupabase = createAdminSupabaseClient();
  const { error } = await adminSupabase.from("profiles").upsert(
    {
      id: userId,
      role,
      full_name: fullName,
      timezone: "America/New_York",
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Unable to create profile: ${error.message}`);
  }

  if (role === "patient") {
    await assignDefaultProvider(userId);
  }
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/dashboard");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message = error.message.toLowerCase().includes("email not confirmed")
      ? "Please confirm your email before signing in."
      : "Unable to sign in. Please check your credentials.";

    redirect(
      buildRedirect(
        "/auth/login",
        message,
        "error",
      ),
    );
  }

  redirect(nextPath);
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const supabase = await createServerSupabaseClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    redirect(buildRedirect("/auth/login", "Unable to send magic link.", "error"));
  }

  redirect(
    buildRedirect(
      "/auth/login",
      "Magic link sent. Check your inbox to continue.",
      "success",
    ),
  );
}

export async function signUpWithPassword(formData: FormData) {
  const rawFullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = toRole(String(formData.get("role") ?? "patient"));
  const fullName = deriveName(rawFullName, email);
  const origin = await getOrigin();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    redirect(buildRedirect("/auth/signup", error.message, "error"));
  }

  if (data.user?.id) {
    try {
      await bootstrapProfile(data.user.id, role, fullName);
    } catch (bootstrapError) {
      const message =
        bootstrapError instanceof Error
          ? bootstrapError.message
          : "Unable to finish account setup.";
      redirect(buildRedirect("/auth/signup", message, "error"));
    }
  }

  redirect(
    buildRedirect(
      "/auth/login",
      "Account created. Check your email for confirmation if required.",
      "success",
    ),
  );
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
