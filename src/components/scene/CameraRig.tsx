"use no memo";
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { PerspectiveCamera } from "three";
import { useGyroParallax } from "@/lib/hooks/useGyroParallax";
import { useAppStore } from "@/lib/store/useAppStore";

/**
 * Registers the camera for the GSAP intro timeline (which owns position.z and
 * fov) and applies mouse/gyro parallax to rotation plus a small x/y position
 * offset, so the two never fight over the same properties. Touch devices get
 * a stronger response: gyro tilt is the whole point of holding the phone.
 */
export function CameraRig() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const registerCamera = useAppStore((state) => state.registerCamera);
  const parallax = useGyroParallax();
  const [touchGain] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
      ? 2.4
      : 1,
  );

  useEffect(() => {
    registerCamera(camera);
  }, [camera, registerCamera]);

  useFrame((_state, delta) => {
    const { phase, reducedMotion } = useAppStore.getState();
    // Parallax only as a living-background effect; off during the flythrough.
    const amount = phase === "terminal" || phase === "decode" ? touchGain : 0;
    if (reducedMotion) return;
    const ease = Math.min(delta * 2.5, 1);

    const targetRotY = -parallax.current.x * 0.06 * amount;
    const targetRotX = -parallax.current.y * 0.04 * amount;
    camera.rotation.y += (targetRotY - camera.rotation.y) * ease;
    camera.rotation.x += (targetRotX - camera.rotation.x) * ease;

    // Slight dolly: makes near/far glyph layers slide against each other.
    const targetPosX = parallax.current.x * 1.6 * amount;
    const targetPosY = -parallax.current.y * 1.0 * amount;
    camera.position.x += (targetPosX - camera.position.x) * ease;
    camera.position.y += (targetPosY - camera.position.y) * ease;
  });

  return null;
}
