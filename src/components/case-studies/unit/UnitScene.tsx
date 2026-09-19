"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  Path,
  Shape,
  SRGBColorSpace,
  type AmbientLight,
  type DirectionalLight,
  type Group,
  type HemisphereLight,
  type PerspectiveCamera,
  type PointLight,
  type ShaderMaterial,
  type ShaderMaterialParameters,
} from "three";
import {
  PHASES,
  backOut,
  makeBrickTexture,
  makeConcreteTexture,
  makeRugTexture,
  makeTileTexture,
  phaseOf,
  planes,
  range,
  smooth,
  unit,
} from "./state";

// One apartment unit, seen as a cutaway diorama in early-morning light. Only
// interior finishing is shown — the brick shell is a given, exactly as PlanSee
// receives units. Everything is procedural: no models, no textures on disk.

const H = 2.9;
const WIN = { x0: -1.1, x1: 2.1, y0: 0.9, y1: 2.4 };
const DOOR = { a: -0.2, b: 1.0, h: 2.3 }; // world z range of the doorway in the left wall
const SUN = { x: 3, y: -5, z: 8 }; // travel direction of the light through the window

const GOLD = "#e0a72a";
const COLD = new Color("#a9bdff");
const WARM = new Color("#ffdcae");
const SKY_COLD = new Color("#9fb4ff");
const SKY_WARM = new Color("#fff1dc");
const GROUND_COLD = new Color("#3a2a1e");
const GROUND_WARM = new Color("#a9835c");

// ------------------------------------------------------------ shared assets
const planMat = new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 1, toneMapped: false });
const ghostMat = new LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0, toneMapped: false });
const coveMat = new MeshBasicMaterial({ color: "#ffd79a", transparent: true, opacity: 0, toneMapped: false });
const glowMat = new MeshBasicMaterial({ color: "#ffc878", transparent: true, opacity: 0, toneMapped: false });
const SPOT_OFF = new Color("#3a3a3e");
const SPOT_ON = new Color("#ffe3b5");

function skyTexture() {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "#8fb8ff");
  grad.addColorStop(0.6, "#d6e6ff");
  grad.addColorStop(1, "#ffe7c2");
  g.fillStyle = grad;
  g.fillRect(0, 0, 8, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// -------------------------------------------------------------- wall shapes
function backWallGeometry(inset: number, depth: number) {
  const s = new Shape();
  s.moveTo(-4, 0);
  s.lineTo(4, 0);
  s.lineTo(4, H);
  s.lineTo(-4, H);
  s.closePath();
  const hole = new Path();
  hole.moveTo(WIN.x0 + inset, WIN.y0 + inset);
  hole.lineTo(WIN.x1 - inset, WIN.y0 + inset);
  hole.lineTo(WIN.x1 - inset, WIN.y1 - inset);
  hole.lineTo(WIN.x0 + inset, WIN.y1 - inset);
  hole.closePath();
  s.holes.push(hole);
  return new ExtrudeGeometry(s, { depth, bevelEnabled: false });
}

// Local x of the left wall is world -z (the wall is rotated a quarter turn).
function leftWallGeometry(inset: number, depth: number) {
  const s = new Shape();
  s.moveTo(-3, 0);
  s.lineTo(-DOOR.b + inset, 0);
  s.lineTo(-DOOR.b + inset, DOOR.h - inset);
  s.lineTo(-DOOR.a - inset, DOOR.h - inset);
  s.lineTo(-DOOR.a - inset, 0);
  s.lineTo(3, 0);
  s.lineTo(3, H);
  s.lineTo(-3, H);
  s.closePath();
  return new ExtrudeGeometry(s, { depth, bevelEnabled: false });
}

// ----------------------------------------------------------------- building
function Shell() {
  const brick = useMemo(() => makeBrickTexture(), []);
  const concrete = useMemo(() => makeConcreteTexture(), []);
  const tiles = useMemo(() => makeTileTexture(), []);
  const sky = useMemo(() => skyTexture(), []);

  const geos = useMemo(
    () => ({
      backBase: backWallGeometry(0, 0.2),
      backPlaster: backWallGeometry(0.02, 0.26),
      backPaint: backWallGeometry(0.04, 0.3),
      leftBase: leftWallGeometry(0, 0.2),
      leftPlaster: leftWallGeometry(0.02, 0.26),
      leftPaint: leftWallGeometry(0.04, 0.3),
    }),
    []
  );

  useFrame(() => {
    const s = unit.s;
    planes.plaster.constant = 3.1 * smooth(range(s, 1.0, 1.55));
    planes.paint.constant = 3.1 * smooth(range(s, 2.0, 2.5));
    planes.tiles.constant = -4.4 + 8.8 * smooth(range(s, 1.35, 1.95));
  });

  const plaster = { color: "#cfc8bb", roughness: 0.95, clippingPlanes: [planes.plaster] };
  const paint = { color: "#ecdfc8", roughness: 0.82, clippingPlanes: [planes.paint] };

  return (
    <group>
      {/* floor slab + porcelain laid over it */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.3, 6.4]} />
        <meshStandardMaterial map={concrete} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial map={tiles} roughness={0.35} metalness={0.05} clippingPlanes={[planes.tiles]} />
      </mesh>

      {/* back wall (window) */}
      <mesh geometry={geos.backBase} position={[0, 0, -3.2]} castShadow receiveShadow>
        <meshStandardMaterial map={brick} roughness={0.92} />
      </mesh>
      <mesh geometry={geos.backPlaster} position={[0, 0, -3.24]} receiveShadow>
        <meshStandardMaterial {...plaster} />
      </mesh>
      <mesh geometry={geos.backPaint} position={[0, 0, -3.26]} receiveShadow>
        <meshStandardMaterial {...paint} />
      </mesh>

      {/* left wall (doorway) */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={geos.leftBase} position={[0, 0, -4.0]} castShadow receiveShadow>
          <meshStandardMaterial map={brick} roughness={0.92} />
        </mesh>
        <mesh geometry={geos.leftPlaster} position={[0, 0, -4.04]} receiveShadow>
          <meshStandardMaterial {...plaster} />
        </mesh>
        <mesh geometry={geos.leftPaint} position={[0, 0, -4.06]} receiveShadow>
          <meshStandardMaterial {...paint} />
        </mesh>
      </group>

      {/* morning sky seen through the window, and the aluminium frame */}
      <mesh position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -3.16]}>
        <planeGeometry args={[WIN.x1 - WIN.x0 + 0.3, WIN.y1 - WIN.y0 + 0.3]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      <WindowFrame />

      {/* the next room, glimpsed through the doorway */}
      <mesh position={[-4.6, DOOR.h / 2, (DOOR.a + DOOR.b) / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DOOR.b - DOOR.a + 0.4, DOOR.h]} />
        <meshBasicMaterial color="#7a6650" toneMapped={false} />
      </mesh>
    </group>
  );
}

function WindowFrame() {
  const w = WIN.x1 - WIN.x0;
  const h = WIN.y1 - WIN.y0;
  const cx = (WIN.x0 + WIN.x1) / 2;
  const cy = (WIN.y0 + WIN.y1) / 2;
  const mat = <meshStandardMaterial color="#1b1c20" roughness={0.5} metalness={0.6} />;
  return (
    <group position={[0, 0, -3.06]}>
      <mesh position={[cx, WIN.y1 - 0.02, 0]}>
        <boxGeometry args={[w, 0.06, 0.08]} />
        {mat}
      </mesh>
      <mesh position={[cx, WIN.y0 + 0.02, 0]}>
        <boxGeometry args={[w, 0.06, 0.08]} />
        {mat}
      </mesh>
      <mesh position={[WIN.x0 + 0.02, cy, 0]}>
        <boxGeometry args={[0.06, h, 0.08]} />
        {mat}
      </mesh>
      <mesh position={[WIN.x1 - 0.02, cy, 0]}>
        <boxGeometry args={[0.06, h, 0.08]} />
        {mat}
      </mesh>
      <mesh position={[cx, cy, 0]}>
        <boxGeometry args={[0.05, h, 0.08]} />
        {mat}
      </mesh>
    </group>
  );
}

// ----------------------------------------------------------- reveal helpers
type PopProps = {
  at: number;
  span?: number;
  out?: number;
  mode?: "pop" | "rise" | "drop";
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode;
};

// Scales a group in (and optionally back out) with unit.s. `rise` grows from
// the floor, `drop` hangs from its origin like drapery, `pop` overshoots.
function Pop({ at, span = 0.3, out, mode = "pop", position, rotation, children }: PopProps) {
  const g = useRef<Group>(null);
  useFrame(() => {
    const G = g.current;
    if (!G) return;
    const t = range(unit.s, at, at + span);
    let e = mode === "pop" ? backOut(t) : smooth(t);
    if (out !== undefined) e *= 1 - smooth(range(unit.s, out, out + 0.3));
    G.visible = e > 0.002;
    const k = Math.max(e, 0.0001);
    if (mode === "pop") G.scale.setScalar(k);
    else G.scale.set(1, k, 1);
  });
  return (
    <group ref={g} position={position} rotation={rotation} visible={false}>
      {children}
    </group>
  );
}

function Ghost({ position, size, out = 3.0 }: { position: [number, number, number]; size: [number, number, number]; out?: number }) {
  const geo = useMemo(() => new EdgesGeometry(new BoxGeometry(...size)), [size]);
  const g = useRef<Group>(null);
  useFrame(() => {
    if (g.current) g.current.visible = unit.s > 0.5 && unit.s < out + 0.6;
  });
  return (
    <group ref={g} position={position}>
      <lineSegments geometry={geo} material={ghostMat} />
    </group>
  );
}

// ---------------------------------------------------------------- 2D layout
type Seg = { ax: number; az: number; bx: number; bz: number };

function rect(x0: number, z0: number, x1: number, z1: number): Seg[] {
  return [
    { ax: x0, az: z0, bx: x1, bz: z0 },
    { ax: x1, az: z0, bx: x1, bz: z1 },
    { ax: x1, az: z1, bx: x0, bz: z1 },
    { ax: x0, az: z1, bx: x0, bz: z0 },
  ];
}

function arc(cx: number, cz: number, r: number, a0: number, a1: number, n = 12): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    out.push({ ax: cx + Math.cos(t0) * r, az: cz + Math.sin(t0) * r, bx: cx + Math.cos(t1) * r, bz: cz + Math.sin(t1) * r });
  }
  return out;
}

const PLAN: Seg[] = [
  ...rect(-3.85, -2.85, 3.85, 2.85), // unit footprint
  ...rect(-3.75, -2.75, -1.25, -2.3), // joinery wall
  ...rect(-2.7, 0.42, -0.1, 1.38), // sofa
  ...rect(-1.95, -0.62, -0.85, -0.02), // coffee table
  ...rect(-2.85, -1.2, -0.05, 0.8), // rug
  ...rect(1.15, -0.05, 2.05, 0.85), // armchair
  ...arc(-3.85, 1.0, 1.0, 0, Math.PI / 2), // door swing
  { ax: -1.1, az: -2.85, bx: 2.1, bz: -2.85 }, // window line
  { ax: -3.85, az: 3.05, bx: 3.85, bz: 3.05 }, // dimension line
  { ax: -3.85, az: 2.95, bx: -3.85, bz: 3.15 },
  { ax: 3.85, az: 2.95, bx: 3.85, bz: 3.15 },
];

function PlanLayer() {
  const g = useRef<Group>(null);
  useFrame(({ clock }) => {
    const G = g.current;
    if (!G) return;
    const s = unit.s;
    const draw = range(s, 0.05, 0.95);
    const fade = 1 - smooth(range(s, 1.5, 2.3));
    planMat.opacity = fade * (0.85 + 0.15 * Math.sin(clock.elapsedTime * 2));
    ghostMat.opacity = 0.8 * smooth(range(s, 0.5, 1.0)) * (1 - smooth(range(s, 3.0, 3.6)));
    G.visible = draw > 0 && fade > 0.001;
    G.children.forEach((child, i) => {
      const seg = PLAN[i];
      const t = smooth(range(draw, (i / PLAN.length) * 0.55, (i / PLAN.length) * 0.55 + 0.45));
      const len = Math.hypot(seg.bx - seg.ax, seg.bz - seg.az);
      const dx = (seg.bx - seg.ax) / len;
      const dz = (seg.bz - seg.az) / len;
      child.position.set(seg.ax + (dx * len * t) / 2, 0.03, seg.az + (dz * len * t) / 2);
      child.rotation.y = -Math.atan2(dz, dx);
      child.scale.set(Math.max(len * t, 0.0001), 1, 1);
    });
  });
  return (
    <group ref={g} visible={false}>
      {PLAN.map((_, i) => (
        <mesh key={i} material={planMat}>
          <boxGeometry args={[1, 0.012, 0.03]} />
        </mesh>
      ))}
    </group>
  );
}

// ------------------------------------------------------------- raw shell props
function RawProps() {
  const pipe = <meshStandardMaterial color="#d9612b" roughness={0.6} />;
  return (
    <>
      <Pop at={-1} span={0.2} out={1.0}>
        {/* conduit along the back wall + a vertical drop */}
        <mesh position={[0, 2.62, -2.94]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 7.8, 8]} />
          {pipe}
        </mesh>
        <mesh position={[-2.2, 1.6, -2.94]}>
          <cylinderGeometry args={[0.025, 0.025, 2.0, 8]} />
          {pipe}
        </mesh>
        <mesh position={[2.9, 1.6, -2.94]}>
          <cylinderGeometry args={[0.025, 0.025, 2.0, 8]} />
          {pipe}
        </mesh>
        <mesh position={[-3.76, 2.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 5.8, 8]} />
          {pipe}
        </mesh>
      </Pop>
      <Pop at={-1} span={0.2} out={1.0} position={[0.4, 0, -0.3]}>
        {/* temporary work light on a wire */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 1.2, 6]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#fff2cf" toneMapped={false} />
        </mesh>
      </Pop>
      <Pop at={-1} span={0.2} out={1.0} position={[-3.1, 0, 2.3]}>
        {/* cement bags */}
        {[0, 1, 2].map((i) => (
          <RoundedBox key={i} args={[0.8, 0.18, 0.5]} radius={0.05} position={[0, 0.09 + i * 0.19, 0]} rotation={[0, i * 0.15, 0]} castShadow>
            <meshStandardMaterial color="#8d857a" roughness={1} />
          </RoundedBox>
        ))}
      </Pop>
      <Pop at={-1} span={0.2} out={1.0} position={[3.0, 0, 2.0]}>
        {/* stacked pipes */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.05 + (i % 2) * 0.09, (i - 1) * 0.11]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 1.1, 10]} />
            <meshStandardMaterial color="#c9622e" roughness={0.6} />
          </mesh>
        ))}
      </Pop>
    </>
  );
}

// ------------------------------------------------------- ceiling & lighting
function Ceiling() {
  const back = useRef<Group>(null);
  useFrame(() => {
    const drop = smooth(range(unit.s, 1.4, 1.95));
    if (back.current) {
      back.current.visible = drop > 0.002;
      back.current.position.y = 0.9 * (1 - drop);
      back.current.scale.setScalar(Math.max(drop, 0.001));
    }
    coveMat.opacity = smooth(range(unit.s, 2.4, 3.0));
  });
  const plasterMat = <meshStandardMaterial color="#f1ebe0" roughness={0.9} />;
  return (
    <group ref={back} visible={false}>
      <mesh position={[0, 2.74, -2.76]} castShadow>
        <boxGeometry args={[7.6, 0.3, 0.48]} />
        {plasterMat}
      </mesh>
      <mesh position={[-3.56, 2.74, 0]} castShadow>
        <boxGeometry args={[0.48, 0.3, 5.5]} />
        {plasterMat}
      </mesh>
      {/* LED cove under the soffit */}
      <mesh position={[0, 2.58, -2.6]} material={coveMat}>
        <boxGeometry args={[7.3, 0.02, 0.06]} />
      </mesh>
      <mesh position={[-3.4, 2.58, 0]} material={coveMat}>
        <boxGeometry args={[0.06, 0.02, 5.2]} />
      </mesh>
    </group>
  );
}

function Downlights() {
  const g = useRef<Group>(null);
  const spots: [number, number][] = [
    [-3.0, -2.5],
    [-1.6, -2.5],
    [2.6, -2.5],
    [3.4, -2.5],
    [-3.3, -1.2],
    [-3.3, 1.4],
  ];
  useFrame(() => {
    const on = smooth(range(unit.s, 2.4, 3.0));
    const drop = smooth(range(unit.s, 1.4, 1.95));
    if (!g.current) return;
    g.current.visible = drop > 0.5;
    g.current.children.forEach((c) => {
      const m = (c as unknown as { material: MeshBasicMaterial }).material;
      m.color.copy(SPOT_OFF).lerp(SPOT_ON, on);
    });
  });
  return (
    <group ref={g} visible={false}>
      {spots.map(([x, z], i) => (
        <mesh key={i} position={[x, 2.575, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 20]} />
          <meshBasicMaterial color="#444" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ------------------------------------------------------------ joinery + décor
function Joinery() {
  useFrame(() => {
    glowMat.opacity = smooth(range(unit.s, 2.6, 3.1));
  });
  const wood = <meshStandardMaterial color="#9a6136" roughness={0.6} />;
  const white = <meshStandardMaterial color="#efe9de" roughness={0.7} />;
  return (
    <Pop at={2.05} span={0.5} mode="rise" position={[-2.5, 0, -2.78]}>
      {/* low cabinet */}
      <RoundedBox args={[2.5, 0.55, 0.46]} radius={0.02} position={[0, 0.275, 0]} castShadow receiveShadow>
        {wood}
      </RoundedBox>
      {/* tall backlit shelving either side */}
      {[-1.0, 1.0].map((x) => (
        <group key={x} position={[x, 0, -0.02]}>
          <RoundedBox args={[0.5, 2.3, 0.42]} radius={0.02} position={[0, 1.15, 0]} castShadow>
            {white}
          </RoundedBox>
          {[0.7, 1.15, 1.6].map((y) => (
            <mesh key={y} position={[0, y, 0.22]} material={glowMat}>
              <boxGeometry args={[0.36, 0.02, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* wall panel + TV */}
      <mesh position={[0, 1.3, -0.16]}>
        <boxGeometry args={[1.5, 1.5, 0.05]} />
        {white}
      </mesh>
      <mesh position={[0, 1.35, -0.12]}>
        <boxGeometry args={[1.25, 0.72, 0.04]} />
        <meshStandardMaterial color="#0c0c0f" roughness={0.3} />
      </mesh>
    </Pop>
  );
}

function Furnishing() {
  const beige = <meshStandardMaterial color="#cdbba3" roughness={0.95} />;
  const cushion = <meshStandardMaterial color="#dccdb6" roughness={0.95} />;
  const rug = useMemo(() => makeRugTexture(), []);
  return (
    <>
      <Pop at={3.02} position={[-1.4, 0, -0.2]}>
        <mesh position={[0, 0.011, 0]} receiveShadow>
          <boxGeometry args={[2.9, 0.02, 2.0]} />
          <meshStandardMaterial map={rug} roughness={1} />
        </mesh>
      </Pop>
      <Pop at={3.15} position={[-1.4, 0, 0.9]}>
        <RoundedBox args={[2.6, 0.4, 0.95]} radius={0.06} position={[0, 0.28, 0]} castShadow receiveShadow>
          {beige}
        </RoundedBox>
        <RoundedBox args={[2.6, 0.5, 0.22]} radius={0.07} position={[0, 0.62, 0.36]} castShadow>
          {beige}
        </RoundedBox>
        {[-0.85, 0, 0.85].map((x) => (
          <RoundedBox key={x} args={[0.82, 0.16, 0.72]} radius={0.05} position={[x, 0.56, -0.05]} castShadow>
            {cushion}
          </RoundedBox>
        ))}
        {[-1.24, 1.24].map((x) => (
          <RoundedBox key={x} args={[0.16, 0.34, 0.95]} radius={0.05} position={[x, 0.5, 0]} castShadow>
            {beige}
          </RoundedBox>
        ))}
      </Pop>
      <Pop at={3.3} position={[-1.4, 0, -0.32]}>
        <RoundedBox args={[1.1, 0.06, 0.62]} radius={0.02} position={[0, 0.42, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#cbbba3" roughness={0.35} />
        </RoundedBox>
        <RoundedBox args={[0.9, 0.38, 0.44]} radius={0.02} position={[0, 0.2, 0]} castShadow>
          <meshStandardMaterial color="#2a2622" roughness={0.6} />
        </RoundedBox>
      </Pop>
      <Pop at={3.4} position={[1.6, 0, 0.4]} rotation={[0, -0.9, 0]}>
        <RoundedBox args={[0.85, 0.36, 0.85]} radius={0.08} position={[0, 0.26, 0]} castShadow receiveShadow>
          {beige}
        </RoundedBox>
        <RoundedBox args={[0.85, 0.5, 0.2]} radius={0.08} position={[0, 0.58, 0.32]} castShadow>
          {beige}
        </RoundedBox>
      </Pop>
      <Pop at={3.5} position={[2.65, 0, 0.95]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.44, 24]} />
          <meshStandardMaterial color="#2a2622" roughness={0.5} />
        </mesh>
      </Pop>
      <Pop at={3.55} position={[3.05, 0, -2.4]}>
        {/* floor lamp */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 20]} />
          <meshStandardMaterial color="#1d1d20" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1.7, 8]} />
          <meshStandardMaterial color="#1d1d20" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 1.75, 0]}>
          <cylinderGeometry args={[0.22, 0.3, 0.32, 24, 1, true]} />
          <meshBasicMaterial color="#ffe1ad" side={DoubleSide} toneMapped={false} />
        </mesh>
      </Pop>
      <Pop at={3.6} position={[3.4, 0, 1.9]}>
        {/* plant */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
          <meshStandardMaterial color="#d8cdbb" roughness={0.8} />
        </mesh>
        {[
          [0, 0.75, 0, 0.32],
          [0.14, 1.0, 0.06, 0.26],
          [-0.15, 0.95, -0.05, 0.24],
          [0.02, 1.2, -0.04, 0.2],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <sphereGeometry args={[r, 14, 14]} />
            <meshStandardMaterial color="#3c6b46" roughness={0.9} />
          </mesh>
        ))}
      </Pop>
      <Pop at={3.62} mode="drop" position={[-1.22, 2.5, -2.86]}>
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[0.7, 2.4, 0.05]} />
          <meshStandardMaterial color="#f3ead8" roughness={1} transparent opacity={0.72} />
        </mesh>
      </Pop>
      <Pop at={3.66} mode="drop" position={[2.3, 2.5, -2.86]}>
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[0.7, 2.4, 0.05]} />
          <meshStandardMaterial color="#f3ead8" roughness={1} transparent opacity={0.72} />
        </mesh>
      </Pop>
      <Pop at={3.7} position={[-3.74, 1.5, -1.95]}>
        {/* framed art on the left wall */}
        <mesh>
          <boxGeometry args={[0.05, 0.95, 0.72]} />
          <meshStandardMaterial color="#c99a3a" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.02, 0.8, 0.58]} />
          <meshStandardMaterial color="#efe3cf" roughness={0.9} />
        </mesh>
      </Pop>
      <Pop at={3.74} position={[-1.4, 2.25, -0.2]}>
        {/* pendant ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.03, 14, 64]} />
          <meshBasicMaterial color="#ffe1ad" toneMapped={false} />
        </mesh>
        {[-0.4, 0.4].map((x) => (
          <mesh key={x} position={[x, 0.7, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 1.4, 6]} />
            <meshBasicMaterial color="#8a6a2a" />
          </mesh>
        ))}
      </Pop>
    </>
  );
}

function Ghosts() {
  return (
    <>
      <Ghost position={[-1.4, 0.45, 0.9]} size={[2.6, 0.9, 0.95]} />
      <Ghost position={[-1.4, 0.24, -0.32]} size={[1.1, 0.48, 0.62]} />
      <Ghost position={[1.6, 0.4, 0.4]} size={[0.85, 0.8, 0.85]} />
      <Ghost position={[-2.5, 1.15, -2.78]} size={[2.5, 2.3, 0.46]} out={2.1} />
    </>
  );
}

// ---------------------------------------------------- morning light & beam
function Light() {
  const sun = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const fill = useRef<AmbientLight>(null);
  const bulb = useRef<PointLight>(null);
  const cove = useRef<PointLight>(null);
  const pendant = useRef<PointLight>(null);
  useFrame(() => {
    const s = unit.s;
    const warm = smooth(range(s, 0, 4));
    if (sun.current) {
      sun.current.color.copy(COLD).lerp(WARM, warm);
      sun.current.intensity = 1.8 + 2.4 * warm;
    }
    if (hemi.current) {
      hemi.current.intensity = 0.5 + 1.0 * warm;
      hemi.current.color.copy(SKY_COLD).lerp(SKY_WARM, warm);
      hemi.current.groundColor.copy(GROUND_COLD).lerp(GROUND_WARM, warm);
    }
    if (fill.current) fill.current.intensity = 0.1 + 0.55 * warm;
    if (bulb.current) bulb.current.intensity = 5 * (1 - smooth(range(s, 1.0, 1.35)));
    const lit = smooth(range(s, 2.4, 3.0));
    if (cove.current) cove.current.intensity = 6 * lit;
    if (pendant.current) pendant.current.intensity = 5 * smooth(range(s, 3.7, 4.0));
  });
  return (
    <>
      <directionalLight
        ref={sun}
        position={[-4.5, 7.5, -12]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      <hemisphereLight ref={hemi} args={["#9fb4ff", "#3a2a1e", 0.5]} />
      <ambientLight ref={fill} color="#fff3e2" intensity={0.1} />
      <pointLight ref={bulb} position={[0.4, 1.8, -0.3]} color="#ffdca0" distance={7} decay={2} />
      <pointLight ref={cove} position={[-1.5, 2.3, -1.6]} color="#ffcf8c" distance={9} decay={2} />
      <pointLight ref={pendant} position={[-1.4, 2.0, -0.2]} color="#ffdfae" distance={6} decay={2} />
    </>
  );
}

const A = { x0: WIN.x0, x1: WIN.x1, y0: WIN.y0, y1: WIN.y1 };
const floorPoint = (x: number, y: number): [number, number, number] => {
  const t = y / -SUN.y;
  return [x + SUN.x * t, 0.012, -3.0 + SUN.z * t];
};
const CORNERS: [number, number][] = [
  [A.x0, A.y0],
  [A.x1, A.y0],
  [A.x1, A.y1],
  [A.x0, A.y1],
];

function Beam() {
  const mat = useRef<ShaderMaterial>(null);
  const motes = useRef<BufferAttribute>(null);
  const seeds = useMemo(() => {
    const a: number[] = [];
    let s = 5;
    const r = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < 150; i++) a.push(r(), r(), r(), r());
    return a;
  }, []);
  const positions = useMemo(() => new Float32Array(150 * 3), []);

  const { geo, args } = useMemo(() => {
    const g = new BufferGeometry();
    const pos: number[] = [];
    const v: number[] = [];
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = CORNERS[i];
      const [bx, by] = CORNERS[(i + 1) % 4];
      const a = [ax, ay, -2.99];
      const b = [bx, by, -2.99];
      const a2 = floorPoint(ax, ay);
      const b2 = floorPoint(bx, by);
      pos.push(...a, ...b, ...b2, ...a, ...b2, ...a2);
      v.push(0, 0, 1, 0, 1, 1);
    }
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute("aV", new BufferAttribute(new Float32Array(v), 1));
    const params: ShaderMaterialParameters = {
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms: { uI: { value: 0 } },
      vertexShader: "attribute float aV; varying float vV; void main(){ vV = aV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader:
        "uniform float uI; varying float vV; void main(){ float a = uI * (1.0 - vV * 0.85) * 0.5; gl_FragColor = vec4(vec3(1.0,0.86,0.6) * a, 1.0); }",
    };
    return { geo: g, args: [params] as [ShaderMaterialParameters] };
  }, []);

  useFrame(({ clock }) => {
    const beam = 0.2 + 0.8 * smooth(range(unit.s, 0, 3.6));
    const u = mat.current?.uniforms;
    if (u) u.uI.value = beam * 0.16;
    const m = motes.current;
    if (!m) return;
    const t = unit.reduced ? 0 : clock.elapsedTime;
    const out = m.array as Float32Array;
    for (let i = 0; i < 150; i++) {
      const [ru, rw, rt, rs] = [seeds[i * 4], seeds[i * 4 + 1], seeds[i * 4 + 2], seeds[i * 4 + 3]];
      const x = A.x0 + (A.x1 - A.x0) * ru;
      const y = A.y0 + (A.y1 - A.y0) * rw;
      const f = (rt + t * 0.012 * (0.5 + rs)) % 1;
      const p = floorPoint(x, y);
      out[i * 3] = x + (p[0] - x) * f + Math.sin(t * 0.4 + rs * 9) * 0.05;
      out[i * 3 + 1] = y + (p[1] - y) * f;
      out[i * 3 + 2] = -2.99 + (p[2] + 2.99) * f;
    }
    m.needsUpdate = true;
  });

  return (
    <>
      <mesh geometry={geo} renderOrder={5}>
        <shaderMaterial ref={mat} args={args} />
      </mesh>
      <points frustumCulled={false} renderOrder={6}>
        <bufferGeometry>
          <bufferAttribute ref={motes} attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#fff0d0" size={0.035} transparent opacity={0.6} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </points>
    </>
  );
}

// ------------------------------------------------------------------- driver
function Driver({ chapterIds, onPhase }: { chapterIds: string[]; onPhase: (p: number) => void }) {
  const els = useRef<(HTMLElement | null)[]>([]);
  const last = useRef(-1);

  useEffect(() => {
    els.current = chapterIds.map((id) => document.querySelector<HTMLElement>(`[data-chapter="${id}"]`));
    unit.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, [chapterIds]);

  useFrame(({ camera, pointer, size }, dt) => {
    const cam = camera as PerspectiveCamera;
    // Keep the whole unit in frame whatever the card's aspect ratio.
    const aspect = size.width / size.height;
    const fov = (2 * Math.atan(Math.max(Math.tan((15 * Math.PI) / 180), 5.4 / (13 * aspect))) * 180) / Math.PI;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    const vh = window.innerHeight;
    let target = 0;
    for (let i = 1; i < els.current.length; i++) {
      const el = els.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      target += Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * 0.5)));
    }
    unit.target = target;
    unit.s = unit.reduced ? target : unit.s + (target - unit.s) * (1 - Math.exp(-Math.min(dt, 0.05) * 4));

    const p = phaseOf(unit.s);
    if (p !== last.current) {
      last.current = p;
      onPhase(p);
    }

    const k = smooth(range(unit.s, 0, 4));
    const px = unit.reduced ? 0 : pointer.x;
    const py = unit.reduced ? 0 : pointer.y;
    camera.position.set(7.4 - 1.5 * k + px * 0.7, 6.3 - 1.6 * k + py * 0.4, 8.7 - 1.5 * k);
    camera.lookAt(0, 0.95, -0.3);
  });
  return null;
}

function Dust() {
  const positions = useMemo(() => {
    const a = new Float32Array(240 * 3);
    let s = 17;
    const r = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < 240; i++) {
      const rad = 9 + r() * 12;
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      a[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = rad * Math.cos(ph) * 0.6;
      a[i * 3 + 2] = rad * Math.sin(ph) * Math.sin(th);
    }
    return a;
  }, []);
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d7a44f" size={0.05} transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </points>
  );
}

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function UnitScene({
  chapterIds,
  onPhase,
  fallback,
}: {
  chapterIds: string[];
  onPhase: (p: number) => void;
  fallback: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [supported] = useState(detectWebGL);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [supported]);

  if (!supported) return <>{fallback}</>;

  return (
    <div ref={wrap} className="absolute inset-0" role="img" aria-label={`Animated unit: ${PHASES[0]} through ${PHASES[PHASES.length - 1]}`}>
      <Canvas
        shadows
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [7.4, 6.3, 8.7], fov: 30, near: 0.5, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
      >
        <Driver chapterIds={chapterIds} onPhase={onPhase} />
        <Light />
        <Dust />
        <Shell />
        <PlanLayer />
        <Ghosts />
        <RawProps />
        <Ceiling />
        <Downlights />
        <Joinery />
        <Furnishing />
        <Beam />
      </Canvas>
    </div>
  );
}
