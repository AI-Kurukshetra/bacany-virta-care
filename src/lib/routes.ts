export const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
] as const;

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/glucose",
  "/nutrition",
  "/medications",
  "/appointments",
  "/messages",
  "/provider",
] as const;
