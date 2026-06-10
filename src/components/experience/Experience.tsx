"use client";

import { useEffect } from "react";
import { Scene } from "@/components/scene/Scene";
import { Terminal } from "@/components/terminal/Terminal";
import { usePageVisibility } from "@/lib/hooks/usePageVisibility";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useAppStore } from "@/lib/store/useAppStore";
import { CrtOverlay } from "./CrtOverlay";
import { DecodeOverlay } from "./DecodeOverlay";
import { HudControls } from "./HudControls";
import { Preloader } from "./Preloader";
import { useIntroTimeline } from "./useIntroTimeline";

/**
 * Client orchestrator. Mounted with ssr:false via ExperienceLoader; flips the
 * data-app-ready flag (which visually hides the static SEO markup), keeps the
 * 3D scene alive across all phases and mounts phase-specific UI on top.
 */
export default function Experience() {
  const phase = useAppStore((state) => state.phase);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const crtEnabled = useAppStore((state) => state.crtEnabled);
  const glitchActive = useAppStore((state) => state.glitchActive);

  useReducedMotion();
  usePageVisibility();
  const { skip } = useIntroTimeline();

  // Hide the static SEO content only once the client app has really mounted.
  useEffect(() => {
    document.documentElement.setAttribute("data-app-ready", "");
    return () => document.documentElement.removeAttribute("data-app-ready");
  }, []);

  // Adopt a theme restored by the pre-paint inline script.
  useEffect(() => {
    const restored = document.documentElement.dataset.theme;
    if ((restored === "green" || restored === "amber") && restored !== theme) {
      setTheme(restored);
    }
  }, [theme, setTheme]);

  return (
    <div className={glitchActive ? "glitching" : undefined}>
      <Scene />
      {phase === "boot" ? <Preloader /> : null}
      {phase === "decode" ? <DecodeOverlay /> : null}
      {phase === "terminal" ? <Terminal /> : null}
      {phase !== "terminal" && phase !== "boot" ? (
        <button
          type="button"
          onClick={skip}
          className="fixed bottom-4 right-4 z-30 rounded border border-term-dim px-3 py-1 text-sm text-term-fg hover:bg-term-faint"
        >
          [skip intro]
        </button>
      ) : null}
      {phase === "terminal" ? <HudControls /> : null}
      {crtEnabled ? <CrtOverlay /> : null}
    </div>
  );
}
