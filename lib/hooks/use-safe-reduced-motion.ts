import { useReducedMotion } from "framer-motion";
import { useMounted } from "./use-mounted";

/**
 * Safely resolves useReducedMotion without causing server/client hydration mismatches.
 * It will always return `false` on the server and initial client render, 
 * then safely switch to the user's preference after hydration.
 */
export function useSafeReducedMotion() {
  const reducedMotion = useReducedMotion();
  const mounted = useMounted();
  return mounted ? reducedMotion : false;
}
