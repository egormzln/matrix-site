"use client";

import { useEffect, useRef } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Fires the callback when the Konami code is typed anywhere on the page. */
export function useKonami(onUnlock: () => void) {
  const progress = useRef(0);
  const callback = useRef(onUnlock);
  callback.current = onUnlock;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const expected = KONAMI[progress.current];
      if (event.key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          callback.current();
        }
      } else {
        progress.current = event.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
