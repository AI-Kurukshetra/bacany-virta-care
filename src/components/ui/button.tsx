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
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all",
        variant === "primary" &&
          "bg-[var(--color-accent)] text-white hover:brightness-95",
        variant === "secondary" &&
          "bg-[var(--color-panel)] text-[var(--color-text)] hover:bg-[var(--color-panel-alt)]",
        variant === "ghost" &&
          "text-[var(--color-text)] hover:bg-[var(--color-panel)]",
        className,
      )}
      {...props}
    />
  );
}
