"use client";

import dynamic from "next/dynamic";

// ssr:false is only legal inside a client component in Next 16 — this file's
// sole purpose is to host the dynamic import. Experience itself flips the
// data-app-ready flag once its chunk has actually mounted.
const Experience = dynamic(() => import("./Experience"), { ssr: false });

export function ExperienceLoader() {
  return <Experience />;
}
