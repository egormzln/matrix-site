"use client";

import { useEffect } from "react";
import { audioEngine } from "@/lib/sound/audioEngine";
import { useAppStore } from "@/lib/store/useAppStore";

/** Corner toggles for sound (muted by default) and the CRT overlay. */
export function HudControls() {
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const setSoundEnabled = useAppStore((state) => state.setSoundEnabled);
  const crtEnabled = useAppStore((state) => state.crtEnabled);
  const setCrtEnabled = useAppStore((state) => state.setCrtEnabled);

  // Restore CRT preference; default on for desktop, off for touch devices
  // (saves compositing work). Sound is never auto-enabled.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("term-crt");
    } catch {
      // private mode — non-fatal
    }
    if (stored !== null) {
      setCrtEnabled(stored === "on");
    } else {
      setCrtEnabled(!window.matchMedia("(pointer: coarse)").matches);
    }
  }, [setCrtEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioEngine.setMuted(!next);
  };

  const toggleCrt = () => {
    const next = !crtEnabled;
    setCrtEnabled(next);
    try {
      localStorage.setItem("term-crt", next ? "on" : "off");
    } catch {
      // private mode — non-fatal
    }
  };

  return (
    <div className="fixed right-3 top-3 z-30 flex gap-2 text-xs">
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundEnabled}
        aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        className="rounded border border-term-dim px-2 py-1 text-term-fg hover:bg-term-faint"
      >
        [{soundEnabled ? "sound: on" : "sound: off"}]
      </button>
      <button
        type="button"
        onClick={toggleCrt}
        aria-pressed={crtEnabled}
        aria-label={crtEnabled ? "Disable CRT effect" : "Enable CRT effect"}
        className="rounded border border-term-dim px-2 py-1 text-term-fg hover:bg-term-faint"
      >
        [{crtEnabled ? "crt: on" : "crt: off"}]
      </button>
    </div>
  );
}
