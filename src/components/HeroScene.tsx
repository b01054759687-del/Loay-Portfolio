"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { AdditiveBlending, type Group, type Mesh } from "three";

// Five disciplines orbiting one person: each gets its own tilted ring and its
// own solid, so the scene says the same thing HeroField's 2D streams say —
// media + creative + data + CRM + AI, converging on the portrait — but with
// real depth. The canvas is layered *over* the portrait, and an invisible
// plane the size of the portrait writes depth only: orbiters passing in front
// draw over the photo, orbiters swinging round the back are hidden by it.

type Shape = "octahedron" | "torus" | "box" | "dodecahedron" | "icosahedron";

type OrbitSpec = {
  shape: Shape;
  radius: number;
  // Ring plane tilt: [about X, about Z], radians.
  tilt: [number, number];
  // Radians per second; the sign is the direction of travel.
  speed: number;
  phase: number;
  size: number;
  warm?: boolean;
};

// Scene units: the canvas is sized so the portrait is exactly PORTRAIT_W x
// PORTRAIT_H at z = 0 (see the wrapper in Hero.tsx and the camera below).
const PORTRAIT_W = 4.41;
const PORTRAIT_H = 5.51;

const ORBITS: OrbitSpec[] = [
  { shape: "octahedron", radius: 2.55, tilt: [0.9, 0.2], speed: 0.32, phase: 0, size: 0.36 },
  { shape: "torus", radius: 2.7, tilt: [-0.7, 0.5], speed: -0.26, phase: 1.3, size: 0.3 },
  { shape: "box", radius: 2.4, tilt: [0.3, -0.9], speed: 0.38, phase: 2.6, size: 0.4 },
  { shape: "dodecahedron", radius: 2.65, tilt: [1.15, -0.4], speed: -0.3, phase: 3.9, size: 0.36 },
  { shape: "icosahedron", radius: 2.5, tilt: [-0.4, 1.0], speed: 0.28, phase: 5.1, size: 0.38, warm: true },
];

const DUST_COUNT = 140;

function readTokens() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue("--accent").trim() || "#4f6bff",
    warm: styles.getPropertyValue("--accent-warm").trim() || "#d7a44f",
  };
}

function detectWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

// Seeded, so the dust field is identical on every mount and the render stays pure.
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Geometry({ shape }: { shape: Shape }) {
  switch (shape) {
    case "octahedron":
      return <octahedronGeometry args={[1, 0]} />;
    case "torus":
      return <torusGeometry args={[0.8, 0.3, 14, 36]} />;
    case "box":
      return <boxGeometry args={[1.3, 1.3, 1.3]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[1, 0]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[1, 0]} />;
  }
}

function Orbiter({ spec, color }: { spec: OrbitSpec; color: string }) {
  const holder = useRef<Group>(null);
  const body = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const a = spec.phase + t * spec.speed;
    holder.current?.position.set(Math.cos(a) * spec.radius, 0, Math.sin(a) * spec.radius);
    if (body.current) {
      body.current.rotation.x = spec.phase + t * 0.5;
      body.current.rotation.y = t * 0.7;
    }
  });

  return (
    <group rotation={[spec.tilt[0], 0, spec.tilt[1]]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[spec.radius, 0.007, 6, 180]} />
        <meshBasicMaterial color={color} transparent opacity={0.32} toneMapped={false} />
      </mesh>
      <group ref={holder} position={[Math.cos(spec.phase) * spec.radius, 0, Math.sin(spec.phase) * spec.radius]}>
        <mesh ref={body} scale={spec.size}>
          <Geometry shape={spec.shape} />
          <meshStandardMaterial
            color="#0d1020"
            metalness={0.7}
            roughness={0.35}
            emissive={color}
            emissiveIntensity={0.35}
          />
          <Edges threshold={20} color={color} />
        </mesh>
      </group>
    </group>
  );
}

function Dust({ color }: { color: string }) {
  const points = useRef<Group>(null);
  const positions = useMemo(() => {
    const rand = mulberry32(7);
    const out = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      out[i * 3] = (rand() - 0.5) * 6.8;
      out[i * 3 + 1] = (rand() - 0.5) * 6.8;
      out[i * 3 + 2] = (rand() - 0.5) * 5;
    }
    return out;
  }, []);

  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.elapsedTime * 0.03;
  });

  return (
    <group ref={points}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Eases the whole scene toward the cursor — the same parallax the portrait
// tilt and HeroField drift already use, so all three layers move as one.
function Rig({ interactive, children }: { interactive: boolean; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: MouseEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, delta * 2.5);
    g.rotation.y += (pointer.current.x * 0.5 - g.rotation.y) * k;
    g.rotation.x += (pointer.current.y * 0.3 - g.rotation.x) * k;
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [supported] = useState(detectWebGL);
  const [tokens] = useState(readTokens);
  const [reduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [inView, setInView] = useState(true);

  // No point burning GPU on a hero that has scrolled away.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!supported) return null;

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Canvas
        frameloop={reduceMotion ? "demand" : inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 3, 6]} intensity={60} color={tokens.accent} />
        <pointLight position={[-5, -3, 4]} intensity={40} color={tokens.warm} />
        <mesh renderOrder={-1}>
          <planeGeometry args={[PORTRAIT_W, PORTRAIT_H]} />
          <meshBasicMaterial colorWrite={false} />
        </mesh>
        <Rig interactive={!reduceMotion}>
          {ORBITS.map((spec) => (
            <Orbiter key={spec.shape} spec={spec} color={spec.warm ? tokens.warm : tokens.accent} />
          ))}
          <Dust color={tokens.accent} />
        </Rig>
      </Canvas>
    </div>
  );
}
