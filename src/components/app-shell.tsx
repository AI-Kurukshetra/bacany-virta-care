import Link from "next/link";
import type { PropsWithChildren } from "react";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";

type AppShellProps = PropsWithChildren<{
  fullName: string;
  role: UserRole;
}>;

const patientLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/glucose", label: "Glucose" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/medications", label: "Medications" },
  { href: "/appointments", label: "Appointments" },
  { href: "/messages", label: "Messages" },
];

const providerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/provider/patients", label: "Patients" },
  { href: "/appointments", label: "Appointments" },
  { href: "/messages", label: "Messages" },
];

export function AppShell({ children, fullName, role }: AppShellProps) {
  const links = role === "provider" ? providerLinks : patientLinks;
  const roleLabel = role === "provider" ? "Care provider" : "Patient";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-panel)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="relative">
            <div className="absolute -left-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-[var(--color-accent)]/70" />
            <Link href="/" className="text-3xl font-bold leading-none tracking-[-0.03em]">
              bacancy-vitra-care
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Remote Metabolic Care
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-alt)] px-4 py-2 text-right shadow-[0_10px_30px_-24px_rgba(11,77,70,0.7)]">
            <p className="text-sm font-semibold">{fullName}</p>
            <p className="text-xs uppercase tracking-[0.11em] text-[var(--color-muted)]">
              {roleLabel}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-[0_26px_70px_-52px_rgba(12,82,73,0.85)] lg:sticky lg:top-24">
          <nav className="space-y-1.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-border)] hover:bg-[var(--color-panel-alt)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-5 border-t border-[var(--color-border)] pt-4">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start rounded-xl border border-[var(--color-border)] px-3 py-2.5 font-semibold"
            >
              Sign out
            </Button>
          </form>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

