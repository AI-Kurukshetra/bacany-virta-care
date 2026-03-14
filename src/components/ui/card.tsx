import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfefd_100%)] p-5 shadow-[0_30px_70px_-52px_rgba(11,74,66,0.85)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />
      {children}
    </section>
  );
}
