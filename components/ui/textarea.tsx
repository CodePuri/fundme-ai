import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "app-input min-h-32 rounded-[6px] px-3.5 py-3 text-sm leading-6",
        className,
      )}
      {...props}
    />
  );
}
