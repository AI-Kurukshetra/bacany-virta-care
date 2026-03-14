import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl bg-[var(--color-panel)] p-8 text-center shadow-[0_20px_40px_-30px_rgba(17,24,39,0.35)]">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          The page you requested does not exist or you do not have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
