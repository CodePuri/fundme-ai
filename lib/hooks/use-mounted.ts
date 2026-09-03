import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const timer = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timer);
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * Returns true once the component has mounted on the client.
 * Use this to safely render client-only UI without causing hydration mismatches.
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
