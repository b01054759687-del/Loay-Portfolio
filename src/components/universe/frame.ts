// Per-frame snapshot shared by every object in the universe. The Rig (first
// useFrame subscriber) fills it once; everything else only reads it.

export type AnchorState = {
  el: HTMLElement;
  x: number; // world units, centre of the anchor at z = 0
  y: number;
  w: number; // world units
  h: number;
  dyn: number; // vertical distance of the anchor centre from screen centre, in screens
  top: number; // px from viewport top
  enter: number; // 0 -> 1 as the anchor scrolls up into view
};

export const BASE_Z = 10;
export const BASE_FOV = 35;

export const frame = {
  time: 0,
  dt: 0.016,
  ppu: 100, // pixels per world unit at z = 0
  vw: 1,
  vh: 1,
  scroll: 0, // page scroll, in world units
  reduced: false,
  warp: 0,
  pointer: { x: 0, y: 0, nx: 0, ny: 0 }, // smoothed; x/y in world units, nx/ny in NDC
  anchors: new Map<string, AnchorState>(),
  loop: { x: 0, y: 0, r: 1, vis: 0 },
};

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
