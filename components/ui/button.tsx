import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "subtle" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset)]",
        size === "sm" && "h-8 px-3 text-[12px]",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-11 px-5",
        variant === "primary" &&
          "border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:border-[var(--button-primary-border-hover)] hover:bg-[var(--button-primary-bg-hover)]",
        variant === "secondary" &&
          "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-[var(--text-primary)] hover:border-[var(--border)] hover:bg-[var(--surface)]",
        variant === "subtle" &&
          "border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
        variant === "danger" &&
          "border-red-500/20 bg-red-500/10 text-red-100 hover:border-red-500/30 hover:bg-red-500/15",
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
});
