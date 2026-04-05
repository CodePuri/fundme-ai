"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-8", className)}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
