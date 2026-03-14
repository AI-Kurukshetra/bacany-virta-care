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
      <main className="mx-auto w-full max-w-7xl space-y-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="animate-fade-in rounded-3xl border border-black/5 bg-[var(--color-panel)] p-8 shadow-[0_30px_60px_-35px_rgba(15,118,110,0.45)] sm:p-10">
            <p className="inline-flex rounded-full bg-[var(--color-panel-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              bacancy-vitra-care MVP
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
              A modern care cockpit for patients and providers.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              Transform remote metabolic care with live biomarker tracking,
              guided nutrition, medication adherence, and secure care-team
              collaboration in one focused workspace.
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
                <p className="mt-2 text-xl font-bold">21-day glucose timeline</p>
              </article>
              <article className="rounded-xl bg-[var(--color-panel-alt)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Adherence
                </p>
                <p className="mt-2 text-xl font-bold">Smart med and meal logs</p>
              </article>
              <article className="rounded-xl bg-[var(--color-panel-alt)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Care Team
                </p>
                <p className="mt-2 text-xl font-bold">Secure async messaging</p>
              </article>
            </div>
          </article>

          <article className="animate-fade-in rounded-3xl border border-black/5 bg-gradient-to-b from-[#0f766e] to-[#115e59] p-6 text-white shadow-[0_30px_60px_-35px_rgba(17,94,89,0.7)] sm:p-8">
            <h2 className="text-2xl font-bold">Inside bacancy-vitra-care</h2>
            <p className="mt-2 text-sm text-teal-100">
              Quick product walkthrough and UI preview.
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/20 bg-black/20">
              <video
                className="h-[230px] w-full object-cover sm:h-[280px]"
                autoPlay
                muted
                loop
                playsInline
                controls
                poster="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80"
              >
                <source
                  src="https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-teal-50">
              <li>Role-based auth with email/password and magic link</li>
              <li>Patient and provider dashboards with seeded data</li>
              <li>Onboarding, glucose, food, medication, appointments, chat</li>
              <li>Supabase schema + RLS + migration-ready SQL</li>
            </ul>
          </article>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="group overflow-hidden rounded-3xl border border-black/5 bg-[var(--color-panel)] shadow-[0_25px_50px_-35px_rgba(15,118,110,0.55)]">
            <div
              role="img"
              aria-label="Provider reviewing patient metrics"
              className="h-52 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Provider View
              </p>
              <p className="mt-2 text-lg font-bold">
                Prioritize high-risk patients instantly
              </p>
            </div>
          </article>
          <article className="group overflow-hidden rounded-3xl border border-black/5 bg-[var(--color-panel)] shadow-[0_25px_50px_-35px_rgba(15,118,110,0.55)]">
            <div
              role="img"
              aria-label="Healthy nutrition planning"
              className="h-52 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Patient View
              </p>
              <p className="mt-2 text-lg font-bold">
                Build sustainable nutrition and habit loops
              </p>
            </div>
          </article>
          <article className="rounded-3xl border border-black/5 bg-[var(--color-panel)] p-6 shadow-[0_25px_50px_-35px_rgba(15,118,110,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Delivery Snapshot
            </p>
            <h3 className="mt-2 text-2xl font-bold">MVP ready for deployment</h3>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Complete route coverage, Supabase data model, seed content, and
              Vercel-ready build pipeline.
            </p>
            <div className="mt-5 space-y-2 text-sm font-medium">
              <p className="rounded-xl bg-[var(--color-panel-alt)] px-3 py-2">
                4 demo accounts
              </p>
              <p className="rounded-xl bg-[var(--color-panel-alt)] px-3 py-2">
                11 feature tables with RLS
              </p>
              <p className="rounded-xl bg-[var(--color-panel-alt)] px-3 py-2">
                Role-aware UX for care teams
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
