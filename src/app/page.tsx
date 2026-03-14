import Link from "next/link";
import { Button } from "@/components/ui/button";

type HomeProps = {
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

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const setupError = getParam(params, "error");

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <main className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="animate-fade-in rounded-3xl border border-black/5 bg-[var(--color-panel)] p-8 shadow-[0_30px_60px_-35px_rgba(15,118,110,0.45)] sm:p-10">
          <p className="inline-flex rounded-full bg-[var(--color-panel-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            VirtaCare MVP
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Reverse chronic disease trajectories with continuous remote care.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
            A production-ready patient and provider platform with secure auth,
            biomarker intelligence, and structured care workflows powered by
            Next.js and Supabase.
          </p>
          {setupError ? (
            <p className="mt-5 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-800">
              {setupError}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/signup">
              <Button className="px-6 py-3 text-sm">Create account</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" className="px-6 py-3 text-sm">
                Sign in
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl bg-[var(--color-panel-alt)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                Monitoring
              </p>
              <p className="mt-2 text-xl font-bold">30-day glucose trends</p>
            </article>
            <article className="rounded-xl bg-[var(--color-panel-alt)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                Adherence
              </p>
              <p className="mt-2 text-xl font-bold">Medication + nutrition logs</p>
            </article>
            <article className="rounded-xl bg-[var(--color-panel-alt)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                Care Team
              </p>
              <p className="mt-2 text-xl font-bold">Secure care messaging</p>
            </article>
          </div>
        </section>

        <section className="animate-fade-in rounded-3xl border border-black/5 bg-gradient-to-b from-[#0f766e] to-[#115e59] p-8 text-white shadow-[0_30px_60px_-35px_rgba(17,94,89,0.7)] sm:p-10">
          <h2 className="text-2xl font-bold">What is included in this MVP</h2>
          <ul className="mt-6 space-y-3 text-sm text-teal-50">
            <li>Role-based auth with email/password and magic link support</li>
            <li>Patient dashboard with glucose trends and biomarker snapshots</li>
            <li>Provider views for assigned patients and risk flags</li>
            <li>Onboarding, food logs, medication tracking, appointments</li>
            <li>Supabase SQL migration + seed script for realistic demo data</li>
            <li>Vercel-ready deployment configuration and documentation</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
