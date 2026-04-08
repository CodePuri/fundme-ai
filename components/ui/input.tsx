import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "app-input h-11 rounded-[10px] px-3.5 text-sm",
        className,
      )}
      {...props}
    />
  );
}
