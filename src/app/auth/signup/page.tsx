import Link from "next/link";
import { signUpWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const error = getParam(params, "error");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md animate-fade-in">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          bacancy-vitra-care
        </p>
        <h1 className="mt-2 text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Start your patient or provider experience.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <form action={signUpWithPassword} className="mt-6 space-y-4">
          <div>
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" name="full_name" type="text" required />
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select id="role" name="role" defaultValue="patient">
              <option value="patient">Patient</option>
              <option value="provider">Provider</option>
            </select>
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" minLength={8} required />
          </div>
          <Button type="submit" className="w-full py-2.5">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link className="font-semibold text-[var(--color-accent-strong)]" href="/auth/login">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}

