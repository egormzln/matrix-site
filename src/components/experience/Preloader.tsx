"use client";

import { useEffect, useState } from "react";

const LINES = ["Establishing connection...", "Decrypting data stream..."];
const BAR_CELLS = 24;

/**
 * Boot-phase cover: typed status lines + an ASCII progress bar. Pure DOM —
 * it runs while the 3D scene compiles behind it, doubling as a load screen.
 */
export function Preloader() {
  const [lineCount, setLineCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lineTimers = LINES.map((_, index) =>
      window.setTimeout(() => setLineCount(index + 1), 250 + index * 650),
    );
    const start = performance.now();
    const interval = window.setInterval(() => {
      const t = Math.min((performance.now() - start) / 1900, 1);
      setProgress(t);
      if (t >= 1) window.clearInterval(interval);
    }, 80);
    return () => {
      for (const timer of lineTimers) window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  const filled = Math.round(progress * BAR_CELLS);
  const bar = "█".repeat(filled) + "░".repeat(BAR_CELLS - filled);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-term-bg">
      <output
        aria-live="polite"
        className="px-6 font-mono text-sm sm:text-base"
      >
        {LINES.slice(0, lineCount).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className="mt-2">
          [{bar}] {Math.round(progress * 100)}%
        </p>
      </output>
    </div>
  );
}
