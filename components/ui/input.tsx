import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
    <input
      className={cn(
        "app-input h-11 rounded-[10px] px-3.5 text-sm",
        className,
      )}
      {...props}
      ref={ref}
    />
    );
  },
);
