import * as THREE from "three";

export const ATLAS_GRID = 16;

// Half-width katakana (the classic Matrix set) + digits + a few latin caps.
const KATAKANA = Array.from({ length: 0xff9d - 0xff66 + 1 }, (_, i) =>
  String.fromCharCode(0xff66 + i),
);
const DIGITS = "0123456789".split("");
const LATIN = "AEGKMSXZ".split("");
export const GLYPHS = [...KATAKANA, ...DIGITS, ...LATIN];

let cached: { texture: THREE.CanvasTexture; count: number } | null = null;

/**
 * Renders all glyphs into a single 1024x1024 canvas texture (16x16 grid),
 * mirrored horizontally for the film look. Client-only; memoized per session.
 */
export function getGlyphAtlas() {
  if (cached) return cached;
  if (typeof document === "undefined") {
    throw new Error("glyph atlas can only be generated in the browser");
  }

  const size = 1024;
  const cell = size / ATLAS_GRID;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");

  // canvas 2d can't resolve CSS variables — read the actual family next/font registered.
  const monoFamily =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-geist-mono")
      .trim() || "ui-monospace, monospace";

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.font = `${Math.floor(cell * 0.78)}px ${monoFamily}, ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  GLYPHS.forEach((glyph, index) => {
    const col = index % ATLAS_GRID;
    const row = Math.floor(index / ATLAS_GRID);
    const cx = col * cell + cell / 2;
    const cy = row * cell + cell / 2;
    ctx.save();
    // Mirror each glyph around its own center — the signature Matrix detail.
    ctx.translate(cx, cy);
    ctx.scale(-1, 1);
    ctx.fillText(glyph, 0, 0);
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  cached = { texture, count: GLYPHS.length };
  return cached;
}
