"use no memo";
"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useAppStore } from "@/lib/store/useAppStore";
import { getGlyphAtlas } from "./glyphAtlas";
import { createRainMaterial, THEME_RAIN_COLORS } from "./rainMaterial";

// The glyph volume. Cells are laid out in vertical columns scattered across
// X and continuously across Z — depth is real, not faked with flat layers.
// xHalf comes from the quality tier: narrow screens get a narrower, denser field.
const FIELD = {
  yHalf: 40,
  zNear: 10,
  zFar: -80,
  cellWidth: 1.1,
  cellHeight: 1.6,
};

export function RainField({
  instanceBudget,
  headBoost,
  xHalf,
  fogDensity,
  trailSharpness,
}: {
  instanceBudget: number;
  headBoost: number;
  xHalf: number;
  fogDensity: number;
  trailSharpness: number;
}) {
  const registerRainUniforms = useAppStore(
    (state) => state.registerRainUniforms,
  );

  const { geometry, material, uniforms } = useMemo(() => {
    const cellsPerColumn = Math.floor((FIELD.yHalf * 2) / FIELD.cellHeight);
    const columns = Math.max(1, Math.floor(instanceBudget / cellsPerColumn));
    const total = columns * cellsPerColumn;

    const offsets = new Float32Array(total * 3);
    const speeds = new Float32Array(total);
    const phases = new Float32Array(total);
    const rows = new Float32Array(total);
    const chars = new Float32Array(total);
    const flips = new Float32Array(total);

    const atlas = getGlyphAtlas();

    let i = 0;
    for (let c = 0; c < columns; c++) {
      const x = (Math.random() * 2 - 1) * xHalf;
      const z = FIELD.zFar + Math.random() * (FIELD.zNear - FIELD.zFar);
      // One head per column: speed in column-sweeps per second.
      const speed = 0.07 + Math.random() * 0.13;
      const phase = Math.random();
      for (let r = 0; r < cellsPerColumn; r++) {
        offsets[i * 3] = x;
        offsets[i * 3 + 1] = FIELD.yHalf - r * FIELD.cellHeight;
        offsets[i * 3 + 2] = z;
        speeds[i] = speed;
        phases[i] = phase;
        rows[i] = r / cellsPerColumn;
        chars[i] = Math.floor(Math.random() * atlas.count);
        // Most cells mutate their glyph occasionally; some stay frozen.
        flips[i] = Math.random() < 0.6 ? 0.5 + Math.random() * 2.5 : 0;
        i++;
      }
    }

    const plane = new THREE.PlaneGeometry(FIELD.cellWidth, FIELD.cellHeight);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = plane.index;
    geometry.setAttribute("position", plane.getAttribute("position"));
    geometry.setAttribute("uv", plane.getAttribute("uv"));
    geometry.instanceCount = total;
    geometry.setAttribute(
      "aOffset",
      new THREE.InstancedBufferAttribute(offsets, 3),
    );
    geometry.setAttribute(
      "aSpeed",
      new THREE.InstancedBufferAttribute(speeds, 1),
    );
    geometry.setAttribute(
      "aPhase",
      new THREE.InstancedBufferAttribute(phases, 1),
    );
    geometry.setAttribute("aRow", new THREE.InstancedBufferAttribute(rows, 1));
    geometry.setAttribute(
      "aChar",
      new THREE.InstancedBufferAttribute(chars, 1),
    );
    geometry.setAttribute(
      "aFlip",
      new THREE.InstancedBufferAttribute(flips, 1),
    );

    const { material, uniforms } = createRainMaterial(
      atlas.texture,
      atlas.count,
      {
        headBoost,
        fogDensity,
        trailSharpness,
      },
    );
    return { geometry, material, uniforms };
  }, [instanceBudget, headBoost, xHalf, fogDensity, trailSharpness]);

  useEffect(() => {
    registerRainUniforms(uniforms);
    // Sync rain color with whatever theme was restored before the scene mounted.
    uniforms.uColor.value.copy(THEME_RAIN_COLORS[useAppStore.getState().theme]);
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [registerRainUniforms, uniforms, geometry, material]);

  // Re-tint the rain when the `theme` command flips the palette.
  useEffect(() => {
    return useAppStore.subscribe((state, prev) => {
      if (state.theme === prev.theme) return;
      const target = THEME_RAIN_COLORS[state.theme];
      gsap.to(uniforms.uColor.value, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: 1.2,
      });
    });
  }, [uniforms]);

  useFrame((_state, delta) => {
    // Reduced motion: the field stays visible but nearly frozen.
    const speed = useAppStore.getState().reducedMotion ? 0.04 : 1;
    uniforms.uTime.value += delta * speed;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
