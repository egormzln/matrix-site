import type { PerspectiveCamera } from "three";
import { create } from "zustand";
import type { RainUniforms } from "@/components/scene/rainMaterial";

export type Phase = "boot" | "rain" | "flythrough" | "decode" | "terminal";
export type Theme = "green" | "amber";
export type QualityTier = "high" | "low";

interface AppState {
  phase: Phase;
  theme: Theme;
  qualityTier: QualityTier;
  soundEnabled: boolean;
  crtEnabled: boolean;
  reducedMotion: boolean;
  /** R3F render loop control: paused when the tab is hidden. */
  frameloop: "always" | "never";
  glitchActive: boolean;
  /** Canvas mounted + rain uniforms registered — the GSAP timeline may build. */
  sceneReady: boolean;
  /** Imperative refs for GSAP / commands. Plain objects, not reactive state. */
  cameraRef: PerspectiveCamera | null;
  rainUniformsRef: RainUniforms | null;

  setPhase: (phase: Phase) => void;
  setTheme: (theme: Theme) => void;
  setQualityTier: (tier: QualityTier) => void;
  setSoundEnabled: (on: boolean) => void;
  setCrtEnabled: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  setFrameloop: (mode: "always" | "never") => void;
  setGlitchActive: (on: boolean) => void;
  registerCamera: (camera: PerspectiveCamera) => void;
  registerRainUniforms: (uniforms: RainUniforms) => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  phase: "boot",
  theme: "green",
  qualityTier: "high",
  soundEnabled: false,
  crtEnabled: true,
  reducedMotion: false,
  frameloop: "always",
  glitchActive: false,
  sceneReady: false,
  cameraRef: null,
  rainUniformsRef: null,

  setPhase: (phase) => set({ phase }),
  setTheme: (theme) => set({ theme }),
  setQualityTier: (qualityTier) => set({ qualityTier }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setFrameloop: (frameloop) => set({ frameloop }),
  setGlitchActive: (glitchActive) => set({ glitchActive }),
  registerCamera: (cameraRef) =>
    set({
      cameraRef,
      sceneReady: cameraRef !== null && get().rainUniformsRef !== null,
    }),
  registerRainUniforms: (rainUniformsRef) =>
    set({
      rainUniformsRef,
      sceneReady: rainUniformsRef !== null && get().cameraRef !== null,
    }),
}));
