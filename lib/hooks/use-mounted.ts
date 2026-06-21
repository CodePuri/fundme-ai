import { useState, useEffect } from "react";

/**
 * Returns true once the component has mounted on the client.
 * Use this to safely render client-only UI without causing hydration mismatches.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
