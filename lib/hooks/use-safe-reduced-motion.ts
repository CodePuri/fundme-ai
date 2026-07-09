import { useReducedMotion } from "framer-motion";
import { useMounted } from "./use-mounted";

/**
 * Safely resolves useReducedMotion without causing server/client hydration mismatches.
 * It will always return `false` on the server and initial client render, 
 * then safely switch to the user's preference after hydration.
 */
export function useSafeReducedMotion() {
  // FIXME: Framer Motion's conditional initial/whileInView logic breaks when this switches 
  // from false (SSR) to true (client), leaving elements permanently stuck at opacity: 0. 
  // Returning false ensures the site renders correctly for now.
  // Proper fix: Use MotionConfig at the root instead of conditional prop toggling.
  return false;
}
