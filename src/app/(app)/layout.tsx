import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireProfile } from "@/lib/auth";
import { hasSupabaseClientEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  if (!hasSupabaseClientEnv()) {
    const params = new URLSearchParams();
    params.set(
      "error",
      "Supabase environment variables are missing. Configure .env.local first.",
    );
    redirect(`/?${params.toString()}`);
  }

  const profile = await requireProfile();
  return (
    <AppShell fullName={profile.full_name} role={profile.role}>
      {children}
    </AppShell>
  );
}
