"use client";

import { useScramble } from "@/components/terminal/useScramble";
import { profile } from "@/lib/content/profile";

/** Bridge between the rain and the terminal: glyphs resolve into the name. */
export function DecodeOverlay() {
  const name = useScramble(profile.name.toUpperCase(), 1400);
  const line = useScramble(`${profile.role} — type \`help\``, 1200, 900);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-4">
      <p className="text-2xl font-bold tracking-[0.2em] text-term-bright sm:text-4xl">
        {name.text}
      </p>
      <p className="mt-4 text-sm text-term-fg sm:text-base">{line.text}</p>
    </div>
  );
}
