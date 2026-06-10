"use no memo";
"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { CameraRig } from "./CameraRig";
import { Effects } from "./Effects";
import { RainField } from "./RainField";

// All quality-tier tuning lives here. The low tier has no Bloom, so it runs
// a narrower, denser field with extra shader glow to stay clearly visible.
const TIERS = {
  high: {
    instanceBudget: 16000,
    maxDpr: 2,
    bloom: true,
    headBoost: 0,
    xHalf: 60,
    fogDensity: 0.022,
    trailSharpness: 6.0,
  },
  low: {
    instanceBudget: 9000,
    maxDpr: 1.5,
    bloom: false,
    headBoost: 1.4,
    xHalf: 24,
    fogDensity: 0.014,
    trailSharpness: 4.2,
  },
} as const;

function detectTier(): keyof typeof TIERS {
  if (typeof window === "undefined") return "high";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return coarse || window.innerWidth < 768 ? "low" : "high";
}

export function Scene() {
  const frameloop = useAppStore((state) => state.frameloop);
  const setQualityTier = useAppStore((state) => state.setQualityTier);
  // Decided once at mount — instance buffers are built from it.
  const [tier] = useState(detectTier);

  useEffect(() => {
    setQualityTier(tier);
  }, [tier, setQualityTier]);

  const config = TIERS[tier];

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0">
      <Canvas
        frameloop={frameloop}
        dpr={[1, config.maxDpr]}
        camera={{ position: [0, 0, 25], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <RainField
          instanceBudget={config.instanceBudget}
          headBoost={config.headBoost}
          xHalf={config.xHalf}
          fogDensity={config.fogDensity}
          trailSharpness={config.trailSharpness}
        />
        <CameraRig />
        {config.bloom ? <Effects /> : null}
      </Canvas>
    </div>
  );
}
