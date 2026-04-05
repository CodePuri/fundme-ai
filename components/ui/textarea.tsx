import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-3xl border border-white/10 bg-[#11141d] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-cyan-300/40 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
