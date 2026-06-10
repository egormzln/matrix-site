"use client";

import { useEffect, useRef } from "react";

export interface ParallaxInput {
  x: number;
  y: number;
}

/**
 * Normalized [-1, 1] parallax input. On touch devices the device orientation
 * (gyroscope) drives it — calibrated against the first reading, so any holding
 * angle is the neutral position. iOS needs an HTTPS + user-gesture permission
 * request, hooked to the first tap. Pointer position is the desktop/denial
 * fallback.
 */
export function useGyroParallax() {
  const input = useRef<ParallaxInput>({ x: 0, y: 0 });

  useEffect(() => {
    let gyroActive = false;
    // Neutral orientation = whatever the first reading says (how the visitor
    // actually holds the phone), not a hardcoded angle.
    let baseline: { gamma: number; beta: number } | null = null;

    const onPointerMove = (event: PointerEvent) => {
      if (gyroActive) return;
      input.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      input.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove);

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      if (!baseline) baseline = { gamma: event.gamma, beta: event.beta };
      gyroActive = true;
      input.current.x = Math.max(
        -1,
        Math.min(1, (event.gamma - baseline.gamma) / 20),
      );
      input.current.y = Math.max(
        -1,
        Math.min(1, (event.beta - baseline.beta) / 20),
      );
    };

    type PermissionRequester = { requestPermission?: () => Promise<string> };
    const requestPermission =
      typeof DeviceOrientationEvent !== "undefined"
        ? (DeviceOrientationEvent as unknown as PermissionRequester)
            .requestPermission
        : undefined;

    let orientationListening = false;
    const enableOrientation = () => {
      if (orientationListening) return;
      window.addEventListener("deviceorientation", onOrientation);
      orientationListening = true;
    };

    const removeGestureListeners = () => {
      window.removeEventListener("touchend", onFirstGesture);
      window.removeEventListener("click", onFirstGesture);
    };

    // iOS: requestPermission must run inside a user gesture. Any first tap
    // qualifies (skip button, terminal, chips). Denial → pointer fallback.
    const onFirstGesture = () => {
      removeGestureListeners();
      requestPermission?.()
        .then((state) => {
          if (state === "granted") enableOrientation();
        })
        .catch(() => {});
    };

    if (typeof requestPermission === "function") {
      window.addEventListener("touchend", onFirstGesture);
      window.addEventListener("click", onFirstGesture);
    } else if ("ontouchstart" in window) {
      // Android & co: no permission API, just listen.
      enableOrientation();
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      removeGestureListeners();
      if (orientationListening)
        window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  return input;
}
