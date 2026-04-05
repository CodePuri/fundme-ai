import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-white/10 bg-[#11141d] px-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-300/40 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
