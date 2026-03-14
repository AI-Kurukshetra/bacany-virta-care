"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseClientEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getSupabaseClientEnv();

  return createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
