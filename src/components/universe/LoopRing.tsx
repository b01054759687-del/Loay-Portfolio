"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type ShaderMaterial,
  type ShaderMaterialParameters,
} from "three";
import { universe } from "@/lib/universe";
import { frame, smoothstep } from "./frame";
import { haloFrag, haloVert, ringFrag, ringVert } from "./shaders";

const BLUE = new Color("#4f6bff");
const GOLD = new Color("#d7a44f");
const DIM = new Color("#2a3266");
const WHITE = new Color("#dfe6ff");

// Diagnose (top) -> Decide (right) -> Connect (bottom) -> Prove (left, gold).
const NODES = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

function LoopNode({ index, progress }: { index: number; progress: React.RefObject<number> }) {
  const body = useRef<Mesh>(null);
  const bodyMat = useRef<MeshBasicMaterial>(null);
  const haloMat = useRef<ShaderMaterial>(null);
  const level = useRef(0);
  const node = NODES[index];
  const warm = index === 3;

  const haloArgs = useMemo(
    () =>
      [
        {
          vertexShader: haloVert,
          fragmentShader: haloFrag,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          uniforms: { uColor: { value: new Color(warm ? "#d7a44f" : "#4f6bff") }, uIntensity: { value: 0 } },
        },
      ] as [ShaderMaterialParameters],
    [warm]
  );

  useFrame(() => {
    const p = progress.current ?? 0;
    const reached = smoothstep(index / 4 - 0.01, index / 4 + 0.02, p);
    const current = Math.min(3, Math.floor(p * 4)) === index ? 1 : 0;
    level.current += (reached * (0.55 + 0.45 * current) - level.current) * (1 - Math.exp(-frame.dt * 8));
    const pulse = frame.reduced ? 1 : 0.9 + 0.1 * Math.sin(frame.time * 3 + index);
    const s = (0.03 + level.current * 0.03) * pulse;
    if (body.current) body.current.scale.setScalar(s / 0.03);
    if (bodyMat.current) bodyMat.current.color.copy(DIM).lerp(warm ? GOLD : WHITE, level.current);
    const hu = haloMat.current?.uniforms;
    if (hu) hu.uIntensity.value = level.current * 1.15 * frame.loop.vis;
  });

  return (
    <group position={[node.x, node.y, 0.02]}>
      <mesh ref={body}>
        <sphereGeometry args={[0.03, 24, 24]} />
        <meshBasicMaterial ref={bodyMat} color="#2a3266" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[0.55, 0.55]} />
        <shaderMaterial ref={haloMat} args={haloArgs} />
      </mesh>
    </group>
  );
}

// The Loop, pinned to the "loop" anchor: a ring whose lit arc is driven by the
// pinned section's scroll progress, with four nodes and a light that travels
// it continuously.
export default function LoopRing() {
  const group = useRef<Group>(null);
  const ringMat = useRef<ShaderMaterial>(null);
  const glowMat = useRef<ShaderMaterial>(null);
  const progress = useRef(0);

  const [ringArgs, glowArgs] = useMemo(() => {
    const make = (glow: number) =>
      [
        {
          vertexShader: ringVert,
          fragmentShader: ringFrag,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          uniforms: {
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uVis: { value: 0 },
            uGlow: { value: glow },
            uBlue: { value: BLUE },
            uGold: { value: GOLD },
          },
        },
      ] as [ShaderMaterialParameters];
    return [make(0), make(1)];
  }, []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const L = frame.anchors.get("loop");
    if (!L || frame.loop.vis < 0.002) {
      g.visible = false;
      return;
    }
    g.visible = true;
    g.position.set(L.x, L.y, 0);
    g.scale.setScalar(frame.loop.r);
    g.rotation.y = frame.pointer.nx * 0.16;
    g.rotation.x = -frame.pointer.ny * 0.1;

    progress.current += (universe.loopProgress - progress.current) * (1 - Math.exp(-frame.dt * 6));
    for (const m of [ringMat.current, glowMat.current]) {
      const u = m?.uniforms;
      if (!u) continue;
      u.uProgress.value = progress.current;
      u.uTime.value = frame.time;
      u.uVis.value = frame.loop.vis;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        <torusGeometry args={[1, 0.0075, 8, 320]} />
        <shaderMaterial ref={ringMat} args={ringArgs} />
      </mesh>
      <mesh>
        <torusGeometry args={[1, 0.05, 8, 320]} />
        <shaderMaterial ref={glowMat} args={glowArgs} />
      </mesh>
      {NODES.map((_, i) => (
        <LoopNode key={i} index={i} progress={progress} />
      ))}
    </group>
  );
}
