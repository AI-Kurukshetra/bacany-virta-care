const requiredClientEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type ClientEnvKey = (typeof requiredClientEnv)[number];
const requiredAdminEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;
type AdminEnvKey = (typeof requiredAdminEnv)[number];

function missingVars(keys: readonly string[]): string[] {
  return keys.filter((key) => !process.env[key]);
}

export function hasSupabaseClientEnv(): boolean {
  return missingVars(requiredClientEnv).length === 0;
}

export function assertSupabaseClientEnv(): void {
  const missing = missingVars(requiredClientEnv);
  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment variables: ${missing.join(", ")}.`,
    );
  }
}

export function getSupabaseClientEnv(): Record<ClientEnvKey, string> {
  assertSupabaseClientEnv();

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}

export function hasSupabaseAdminEnv(): boolean {
  return missingVars(requiredAdminEnv).length === 0;
}

export function assertSupabaseAdminEnv(): void {
  const missing = missingVars(requiredAdminEnv);
  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase admin environment variables: ${missing.join(", ")}.`,
    );
  }
}

export function getSupabaseAdminEnv(): Record<AdminEnvKey, string> {
  assertSupabaseAdminEnv();

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  };
}
