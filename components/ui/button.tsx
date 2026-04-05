import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
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
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-cyan-300 text-slate-950 shadow-[0_12px_40px_rgba(83,214,255,0.18)] hover:-translate-y-0.5 hover:bg-cyan-200",
        variant === "secondary" &&
          "border border-white/12 bg-white/6 text-white hover:-translate-y-0.5 hover:bg-white/10",
        variant === "ghost" && "text-white/70 hover:bg-white/6 hover:text-white",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
