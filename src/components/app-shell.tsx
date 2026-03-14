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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[var(--color-panel)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              bacancy-vitra-care
            </Link>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Remote Metabolic Care
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-[var(--color-muted)]">{role}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-black/5 bg-[var(--color-panel)] p-4">
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--color-panel-alt)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-4 border-t border-black/10 pt-4">
            <Button type="submit" variant="ghost" className="w-full justify-start">
              Sign out
            </Button>
          </form>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

