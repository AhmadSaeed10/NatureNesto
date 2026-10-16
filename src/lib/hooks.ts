"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** True only on devices with a precise, hover capable pointer. False during SSR. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}

/** Pointer driven and scroll linked effects run only with a fine pointer and motion allowed. */
export function useRichMotion(): boolean {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  return fine && !reduced;
}
