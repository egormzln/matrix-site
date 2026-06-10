"use client";

import { useEffect } from "react";
import { audioEngine } from "@/lib/sound/audioEngine";
import { useAppStore } from "@/lib/store/useAppStore";

/** Pauses the R3F render loop and suspends audio while the tab is hidden. */
export function usePageVisibility() {
  const setFrameloop = useAppStore((state) => state.setFrameloop);

  useEffect(() => {
    const onVisibilityChange = () => {
      const hidden = document.hidden;
      setFrameloop(hidden ? "never" : "always");
      if (hidden) {
        audioEngine.suspend();
      } else {
        audioEngine.resume();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [setFrameloop]);
}
