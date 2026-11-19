"use client";

import { useSyncExternalStore } from "react";

// The year does not change while a page stays open, so there is nothing to
// subscribe to. A stable no-op keeps the external-store contract intact.
const subscribe = () => () => {};

/**
 * Returns the current year on the client and `null` during server rendering.
 * `useSyncExternalStore` keeps this hydration-safe without setting state
 * inside an effect.
 */
export function useClientYear() {
  return useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
}
