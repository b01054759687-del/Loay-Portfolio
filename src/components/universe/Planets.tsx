"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  type Group,
  type Mesh,
  type ShaderMaterial,
  type ShaderMaterialParameters,
} from "three";
import { universe, worldVisuals } from "@/lib/universe";
import { frame } from "./frame";
import { haloFrag, haloVert, planetFrag, planetVert } from "./shaders";

const GOLD = new Color("#d7a44f");

function slugSeed(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 997;
  return h / 997;
}

// One world = one planet with its own shader language, pinned to the card's
// stage element. Hovering the card (DOM) lifts and ignites the planet (WebGL).
function Planet({ slug }: { slug: string }) {
  const v = worldVisuals[slug];
  const group = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const moon = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const haloMat = useRef<ShaderMaterial>(null);
  const hover = useRef(0);
  const seed = useMemo(() => slugSeed(slug), [slug]);

  const { planetArgs, haloArgs } = useMemo(() => {
    const color = new Color(v.color[0], v.color[1], v.color[2]);
    return {
      planetArgs: [
        {
          vertexShader: planetVert,
          fragmentShader: planetFrag,
          uniforms: {
            uTime: { value: 0 },
            uHover: { value: 0 },
            uSeed: { value: seed * 6.28 },
            uDim: { value: v.live ? 0 : 1 },
            uKind: { value: v.kind },
            uColor: { value: color },
            uGoldC: { value: GOLD },
          },
        },
      ] as [ShaderMaterialParameters],
      haloArgs: [
        {
          vertexShader: haloVert,
          fragmentShader: haloFrag,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          uniforms: { uColor: { value: color }, uIntensity: { value: 0.5 } },
        },
      ] as [ShaderMaterialParameters],
    };
  }, [v, seed]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const a = frame.anchors.get(`world:${slug}`);
    if (!a || a.enter < 0.001 || Math.abs(a.dyn) > 1.5) {
      g.visible = false;
      return;
    }
    g.visible = true;

    hover.current += ((universe.hovered === slug ? 1 : 0) - hover.current) * (1 - Math.exp(-frame.dt * 6));
    const r = 0.44 * Math.min(a.w, a.h);
    const bob = frame.reduced ? 0 : Math.sin(frame.time * 0.7 + seed * 6.28) * 0.04 * r;
    g.position.set(a.x, a.y + bob, 0);
    g.scale.setScalar(r * (0.6 + 0.4 * a.enter) * (1 + 0.09 * hover.current));
    g.rotation.y += (frame.pointer.nx * 0.3 - g.rotation.y) * Math.min(1, frame.dt * 2);
    g.rotation.x += (-frame.pointer.ny * 0.2 - g.rotation.x) * Math.min(1, frame.dt * 2);

    const u = mat.current?.uniforms;
    if (u) {
      u.uTime.value = frame.time + seed * 40;
      u.uHover.value = hover.current;
    }
    const hu = haloMat.current?.uniforms;
    if (hu) hu.uIntensity.value = ((v.live ? 0.6 : 0.3) + hover.current * 0.55) * a.enter;

    if (ring.current) ring.current.rotation.y = frame.time * 0.15;
    if (moon.current) {
      const t = frame.time * 0.5 + seed * 10;
      moon.current.position.set(Math.cos(t) * 1.38, 0, Math.sin(t) * 1.38);
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        {v.kind === 1 ? <icosahedronGeometry args={[1, 2]} /> : <sphereGeometry args={[1, 72, 72]} />}
        <shaderMaterial ref={mat} args={planetArgs} />
      </mesh>
      <mesh position={[0, 0, -0.7]} renderOrder={-1}>
        <planeGeometry args={[3.4, 3.4]} />
        <shaderMaterial ref={haloMat} args={haloArgs} />
      </mesh>
      <group rotation={[1.25, 0, 0.35 + seed]}>
        <group ref={ring}>
          <mesh>
            <torusGeometry args={[1.38, 0.006, 6, 160]} />
            <meshBasicMaterial color={v.live ? "#d7a44f" : "#4f6bff"} transparent opacity={0.28} toneMapped={false} />
          </mesh>
          <mesh ref={moon}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={v.live ? "#f6d8a0" : "#a9b8ff"} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Planets() {
  return (
    <>
      {Object.keys(worldVisuals).map((slug) => (
        <Planet key={slug} slug={slug} />
      ))}
    </>
  );
}
