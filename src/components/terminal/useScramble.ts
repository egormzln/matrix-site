"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";

const SCRAMBLE_CHARSET = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEFXYZ#$%&";

function randomChar() {
  return SCRAMBLE_CHARSET[Math.floor(Math.random() * SCRAMBLE_CHARSET.length)];
}

/**
 * Text-scramble effect: every character cycles random matrix glyphs, then
 * locks to the target left-to-right over `duration` ms. Resolves instantly
 * under prefers-reduced-motion.
 */
export function useScramble(target: string, duration = 1200, startDelay = 0) {
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const [text, setText] = useState(reducedMotion ? target : "");
  const [done, setDone] = useState(reducedMotion);
  const frame = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setText(target);
      setDone(true);
      return;
    }

    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now + startDelay;
      const elapsed = now - start;
      if (elapsed < 0) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const locked = Math.floor(target.length * progress);
      let next = target.slice(0, locked);
      for (let i = locked; i < target.length; i++) {
        next += target[i] === " " ? " " : randomChar();
      }
      setText(next);
      if (progress >= 1) {
        setDone(true);
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, startDelay, reducedMotion]);

  return { text, done };
}
