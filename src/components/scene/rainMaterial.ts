import * as THREE from "three";
import type { QualityTier } from "@/lib/store/useAppStore";
import { ATLAS_GRID } from "./glyphAtlas";

/**
 * Rain brightness once the intro is over and the terminal is up.
 * The low tier has no Bloom and fewer glyphs, so it needs to run brighter
 * to stay visible as a living background.
 */
export const RAIN_BACKGROUND_INTENSITY: Record<QualityTier, number> = {
  high: 0.22,
  low: 0.45,
};

export const THEME_RAIN_COLORS = {
  green: new THREE.Color("#00ff66"),
  amber: new THREE.Color("#ffb000"),
} as const;

export interface RainUniforms {
  uTime: { value: number };
  uIntensity: { value: number };
  uColor: { value: THREE.Color };
  uAtlas: { value: THREE.Texture };
  uAtlasCount: { value: number };
  uTrailSharpness: { value: number };
  uFogDensity: { value: number };
  /** Extra head glow for the mobile tier, which has no Bloom pass. */
  uHeadBoost: { value: number };
  [uniform: string]: { value: unknown };
}

/*
 * The core trick (faithful to the film): glyph quads never move. Each instance
 * is a static cell in a 3D volume; the vertex shader only animates WHICH glyph
 * a cell shows, and the fragment shader animates a brightness wave ("the drop")
 * sweeping down each column. Per-frame CPU cost is a single uTime write.
 */
const vertexShader = /* glsl */ `
  attribute vec3 aOffset;     // cell position in the volume
  attribute float aSpeed;     // per-column fall speed
  attribute float aPhase;     // per-column random phase
  attribute float aRow;       // normalized row within the column (0 top .. 1 bottom)
  attribute float aChar;      // base glyph index in the atlas
  attribute float aFlip;      // per-cell glyph mutation rate (Hz)

  uniform float uTime;
  uniform float uAtlasCount;

  varying vec2 vCellUv;
  varying vec2 vAtlasCell;
  varying float vRow;
  varying float vSpeed;
  varying float vPhase;
  varying float vDepth;

  void main() {
    vCellUv = uv;

    // Cells mutate their glyph over time: idx = base + floor(t * rate).
    float grid = ${ATLAS_GRID}.0;
    float idx = mod(aChar + floor(uTime * aFlip), uAtlasCount);
    float col = mod(idx, grid);
    float row = floor(idx / grid);
    // Atlas was drawn top-down; texture v runs bottom-up.
    vAtlasCell = vec2(col, grid - 1.0 - row);

    vRow = aRow;
    vSpeed = aSpeed;
    vPhase = aPhase;

    vec4 mvPosition = modelViewMatrix * vec4(position + aOffset, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  uniform float uTrailSharpness;
  uniform float uFogDensity;
  uniform float uHeadBoost;

  varying vec2 vCellUv;
  varying vec2 vAtlasCell;
  varying float vRow;
  varying float vSpeed;
  varying float vPhase;
  varying float vDepth;

  void main() {
    float grid = ${ATLAS_GRID}.0;
    vec2 atlasUv = (vAtlasCell + vCellUv) / grid;
    float glyph = texture2D(uAtlas, atlasUv).a;
    if (glyph < 0.05) discard;

    // The "drop": a brightness head sweeping down the column, wrapping forever.
    float head = fract(uTime * vSpeed + vPhase);
    float dist = fract(vRow - head);

    float trail = pow(1.0 - dist, uTrailSharpness);
    float isHead = smoothstep(0.035, 0.0, dist);

    // Head glyph goes white-hot and over 1.0 — that's what Bloom picks up.
    vec3 headColor = mix(uColor, vec3(1.0), 0.85);
    vec3 color = uColor * trail + headColor * isHead * (1.6 + uHeadBoost);

    // Manual exponential depth fade (additive blending: fade to black = fog).
    float fog = exp(-vDepth * uFogDensity);

    float alpha = glyph * (trail * 0.85 + isHead) * uIntensity * fog;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export interface RainMaterialOptions {
  /** Extra head glow for tiers without a Bloom pass. */
  headBoost: number;
  fogDensity: number;
  /** Lower = wider, brighter trails (mobile compensation). */
  trailSharpness: number;
}

export function createRainMaterial(
  atlas: THREE.Texture,
  atlasCount: number,
  options: RainMaterialOptions,
) {
  const uniforms: RainUniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uColor: { value: THEME_RAIN_COLORS.green.clone() },
    uAtlas: { value: atlas },
    uAtlasCount: { value: atlasCount },
    uTrailSharpness: { value: options.trailSharpness },
    uFogDensity: { value: options.fogDensity },
    uHeadBoost: { value: options.headBoost },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { material, uniforms };
}
