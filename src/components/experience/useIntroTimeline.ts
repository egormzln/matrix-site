"use no memo";
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useRef } from "react";
import { RAIN_BACKGROUND_INTENSITY } from "@/components/scene/rainMaterial";
import { useAppStore } from "@/lib/store/useAppStore";

gsap.registerPlugin(useGSAP);

/**
 * The master intro timeline: boot → rain → flythrough → decode → terminal.
 * GSAP owns all continuous values (camera position/fov, rain intensity);
 * zustand phases are flipped by .call() at the labels, driving React
 * mounts/unmounts. Skip = jump to progress(1): the same calls fire in order,
 * so the end state is identical to a natural finish.
 */
export function useIntroTimeline() {
  const sceneReady = useAppStore((state) => state.sceneReady);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (!sceneReady) return;
      const store = useAppStore.getState();
      if (store.phase !== "boot") return;

      const camera = store.cameraRef;
      const rain = store.rainUniformsRef;
      if (!camera || !rain) return;

      const setPhase = store.setPhase;
      const backgroundIntensity = RAIN_BACKGROUND_INTENSITY[store.qualityTier];

      // Reduced motion: no cinema — land straight in the terminal over a calm field.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        rain.uIntensity.value = backgroundIntensity;
        camera.position.z = -45;
        setPhase("terminal");
        return;
      }

      const tl = gsap.timeline();

      // boot: preloader types its lines while shaders warm up behind it.
      tl.set(rain.uIntensity, { value: 1 });
      tl.call(() => setPhase("rain"), undefined, 2.3);

      // rain: hold on the falling wall.
      tl.to({}, { duration: 2.6 });

      // flythrough: dive through the volume; fov push sells the speed.
      tl.call(() => setPhase("flythrough"));
      tl.to(
        camera.position,
        { z: -45, duration: 5, ease: "power2.inOut" },
        "<",
      );
      tl.to(
        camera,
        {
          fov: 88,
          duration: 2.5,
          ease: "power2.in",
          onUpdate: () => camera.updateProjectionMatrix(),
        },
        "<",
      );
      tl.to(
        camera,
        {
          fov: 75,
          duration: 2.5,
          ease: "power2.out",
          onUpdate: () => camera.updateProjectionMatrix(),
        },
        "<2.5",
      );

      // decode: rain recedes into a dim living background while text resolves.
      tl.call(() => setPhase("decode"));
      tl.to(
        rain.uIntensity,
        {
          value: backgroundIntensity,
          duration: 2.2,
          ease: "power2.inOut",
        },
        "<",
      );
      tl.to({}, { duration: 1.4 });

      tl.call(() => setPhase("terminal"));

      timeline.current = tl;
    },
    { dependencies: [sceneReady] },
  );

  const skip = useCallback(() => {
    timeline.current?.progress(1, false);
  }, []);

  return { skip };
}
