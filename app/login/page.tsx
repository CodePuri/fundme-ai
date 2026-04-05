"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useDemo } from "@/components/app/demo-provider";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useDemo();

  async function handleSignIn() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    signIn();
    router.push("/app/upload");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-[36px] p-8"
        initial={{ opacity: 0, y: 18 }}
      >
        <div className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Continue to Fundme.ai
        </div>
        <p className="mt-3 text-sm leading-7 text-white/55">
          Mocked sign in for the demo. One click gets you into the founder workflow.
        </p>

        <Button className="mt-8 w-full justify-center" onClick={handleSignIn}>
          {loading ? "Signing in with Google..." : "Continue with Google"}
        </Button>
      </motion.div>
    </main>
  );
}
