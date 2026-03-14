const requiredClientEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type ClientEnvKey = (typeof requiredClientEnv)[number];

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
