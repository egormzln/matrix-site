"use no memo";
"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";

/**
 * Desktop-only post pipeline. The Bloom threshold sits at 0.9 so only the
 * over-bright leading glyphs glow; trails stay crisp. The mobile tier never
 * mounts this component — its glow is faked in the rain shader instead.
 */
export function Effects() {
  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.9}
        luminanceSmoothing={0.2}
        intensity={0.9}
      />
    </EffectComposer>
  );
}
