import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-black/5 bg-[var(--color-panel)] p-5 shadow-[0_20px_40px_-30px_rgba(17,24,39,0.35)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
