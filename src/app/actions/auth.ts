"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/dashboard");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(
      buildRedirect(
        "/auth/login",
        "Unable to sign in. Please check your credentials.",
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
      emailRedirectTo: `${origin}/auth/callback`,
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
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "patient");
  const origin = await getOrigin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        role: role === "provider" ? "provider" : "patient",
      },
    },
  });

  if (error) {
    redirect(buildRedirect("/auth/signup", error.message, "error"));
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
