"use client";

/** CRT look: scanlines + vignette + slow flicker, all in CSS (globals.css). */
export function CrtOverlay() {
  return (
    <div
      aria-hidden="true"
      className="crt-overlay pointer-events-none fixed inset-0 z-40"
    />
  );
}
