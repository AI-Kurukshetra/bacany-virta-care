import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/35 focus-visible:ring-offset-2",
        variant === "primary" &&
          "border border-transparent bg-[var(--color-accent)] text-white shadow-[0_16px_36px_-24px_rgba(15,118,110,0.9)] hover:-translate-y-px hover:brightness-95",
        variant === "secondary" &&
          "border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text)] hover:-translate-y-px hover:bg-[var(--color-panel-alt)]",
        variant === "ghost" &&
          "text-[var(--color-text)] hover:bg-[var(--color-panel-alt)]",
        className,
      )}
      {...props}
    />
  );
}
