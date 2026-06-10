"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/useAppStore";

/** Mirrors prefers-reduced-motion into the app store, reacting to live changes. */
export function useReducedMotion() {
  const setReducedMotion = useAppStore((state) => state.setReducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [setReducedMotion]);
}
