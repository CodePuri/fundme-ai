"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDemo } from "@/components/app/demo-provider";
import { PublicAuthModal } from "@/components/public/public-auth-modal";
import { type AuthIntent, parseAuthIntent, stripAuthQuery } from "@/lib/auth-intent";

function buildCleanHref(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function PublicAuthController({
  fallbackIntent,
}: {
  fallbackIntent: AuthIntent;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { signIn, state } = useDemo();
  const [loading, setLoading] = useState(false);

  const authOpen = searchParams.get("auth") === "1";
  const resolvedIntent = useMemo(
    () => parseAuthIntent(searchParams.get("intent")) ?? fallbackIntent,
    [fallbackIntent, searchParams],
  );

  useEffect(() => {
    if (!authOpen || !state.isAuthenticated) {
      return;
    }

    startTransition(() => {
      router.replace(resolvedIntent.destination);
    });
  }, [authOpen, resolvedIntent.destination, router, state.isAuthenticated]);

  function closeModal() {
    const next = stripAuthQuery(new URLSearchParams(searchParams.toString()));
    router.replace(buildCleanHref(pathname, next), { scroll: false });
  }

  async function handleContinue() {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      signIn();
      router.push(resolvedIntent.destination);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicAuthModal
      loading={loading}
      onClose={closeModal}
      onContinue={handleContinue}
      open={authOpen}
    />
  );
}
