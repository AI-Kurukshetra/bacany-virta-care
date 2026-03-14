import Link from "next/link";
import { sendMagicLink, signInWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type LoginPageProps = {
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = getParam(params, "error");
  const success = getParam(params, "success");
  const nextPath = getParam(params, "next") ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md animate-fade-in">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          VirtaCare
        </p>
        <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Continue to your patient or provider workspace.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 rounded-lg bg-teal-100 px-3 py-2 text-sm text-teal-700">
            {success}
          </p>
        ) : null}

        <form action={signInWithPassword} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full py-2.5">
            Sign in with password
          </Button>
        </form>

        <form action={sendMagicLink} className="mt-6 space-y-4">
          <div>
            <label htmlFor="magic-email">Magic link email</label>
            <input id="magic-email" name="email" type="email" required />
          </div>
          <Button type="submit" variant="secondary" className="w-full py-2.5">
            Send magic link
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          New to VirtaCare?{" "}
          <Link className="font-semibold text-[var(--color-accent-strong)]" href="/auth/signup">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
