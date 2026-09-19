import { CanvasTexture, Plane, RepeatWrapping, SRGBColorSpace, Vector3 } from "three";

// s runs 0 -> 4 across the PlanSee chapters: the closer the reader is to the
// end of chapter N, the further along the finishing the unit is.
//   0..1  2D design   (plan draws itself on the raw floor)
//   1..2  execution   (plaster, floor, ceiling works)
//   2..3  systems     (paint, joinery, lighting)
//   3..4  handover    (furnishing, curtains, art)
export const unit = { s: 0, target: 0, reduced: false };

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
export const backOut = (t: number) => {
  const c = clamp01(t);
  const k = 1.4;
  return 1 + (k + 1) * Math.pow(c - 1, 3) + k * Math.pow(c - 1, 2);
};
export const range = (s: number, a: number, b: number) => clamp01((s - a) / (b - a));

// Clipping planes that "wipe" a finishing layer over the raw one. Module-level
// so the scene can mutate them per frame without going through React state.
export const planes = {
  plaster: new Plane(new Vector3(0, -1, 0), -0.01), // keeps y <= constant: wall rises bottom-up
  paint: new Plane(new Vector3(0, -1, 0), -0.01),
  tiles: new Plane(new Vector3(-1, 0, 0), -4.4), // keeps x <= constant: laid left to right
};

export const PHASES = [
  "Raw shell — received as built",
  "2D design — layout & lighting plan",
  "Plastering & wall preparation",
  "Flooring & ceiling works",
  "Paint & joinery",
  "Lighting & final details",
  "Furnishing",
  "Handover",
];

export const PHASE_STARTS = [0, 0.08, 1, 1.35, 2, 2.5, 3, 3.85];

export function phaseOf(s: number) {
  let p = 0;
  for (let i = 0; i < PHASE_STARTS.length; i++) if (s >= PHASE_STARTS[i]) p = i;
  return p;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(size: number, repeat: [number, number], draw: (g: CanvasRenderingContext2D, n: number) => void) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  draw(g, size);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
}

// Red hollow brick, as the units arrive.
export function makeBrickTexture() {
  return canvasTexture(512, [0.83, 0.83], (g, n) => {
    const r = rng(3);
    g.fillStyle = "#8f877b";
    g.fillRect(0, 0, n, n);
    const bw = 128;
    const bh = 64;
    for (let row = 0; row < n / bh; row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let col = -1; col < n / bw + 1; col++) {
        const k = 0.86 + r() * 0.3;
        g.fillStyle = `rgb(${Math.round(182 * k)},${Math.round(90 * k)},${Math.round(62 * k)})`;
        g.fillRect(col * bw + off + 3, row * bh + 3, bw - 6, bh - 6);
        g.fillStyle = "rgba(60,25,15,0.35)";
        for (let s = 0; s < 3; s++) g.fillRect(col * bw + off + 16 + s * 36, row * bh + 11, 22, bh - 22);
      }
    }
  });
}

export function makeConcreteTexture() {
  return canvasTexture(512, [4, 3], (g, n) => {
    const r = rng(9);
    g.fillStyle = "#77726b";
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2600; i++) {
      const v = 90 + Math.floor(r() * 60);
      g.fillStyle = `rgba(${v},${v - 4},${v - 10},0.35)`;
      g.fillRect(r() * n, r() * n, 2 + r() * 5, 2 + r() * 5);
    }
  });
}

// Large-format porcelain: two by two tiles per texture, hairline grout.
export function makeTileTexture() {
  return canvasTexture(512, [5, 3.75], (g, n) => {
    const r = rng(21);
    const t = n / 2;
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const k = 0.94 + r() * 0.08;
        g.fillStyle = `rgb(${Math.round(216 * k)},${Math.round(207 * k)},${Math.round(193 * k)})`;
        g.fillRect(x * t, y * t, t, t);
        g.strokeStyle = "rgba(255,255,255,0.28)";
        g.lineWidth = 2;
        for (let v = 0; v < 4; v++) {
          g.beginPath();
          g.moveTo(x * t + r() * t, y * t + r() * t);
          g.quadraticCurveTo(x * t + r() * t, y * t + r() * t, x * t + r() * t, y * t + r() * t);
          g.stroke();
        }
      }
    }
    g.strokeStyle = "#b3aa9b";
    g.lineWidth = 5;
    g.strokeRect(0, 0, n, n);
    g.beginPath();
    g.moveTo(t, 0);
    g.lineTo(t, n);
    g.moveTo(0, t);
    g.lineTo(n, t);
    g.stroke();
  });
}

export function makeRugTexture() {
  return canvasTexture(256, [1, 1], (g, n) => {
    g.fillStyle = "#e6dccb";
    g.fillRect(0, 0, n, n);
    g.strokeStyle = "#c9b48a";
    g.lineWidth = 6;
    g.strokeRect(14, 14, n - 28, n - 28);
    g.lineWidth = 2;
    g.strokeRect(28, 28, n - 56, n - 56);
  });
}
