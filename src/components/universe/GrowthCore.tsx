"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, type Group, type ShaderMaterial, type ShaderMaterialParameters } from "three";
import { universe } from "@/lib/universe";
import { frame } from "./frame";
import { coreFrag, coreVert, haloFrag, haloVert } from "./shaders";

const BLUE = new Color("#4f6bff");
const VIOLET = new Color("#7a5cff");
const GOLD = new Color("#d7a44f");

// The protagonist: one living orb that follows whichever anchor is nearest
// the middle of the screen — it starts in the hero, glides down to become the
// heart of the Loop, and flares every time the loop advances a step.
export default function GrowthCore() {
  const group = useRef<Group>(null);
  const coreMat = useRef<ShaderMaterial>(null);
  const haloMat = useRef<ShaderMaterial>(null);
  const energy = useRef(0.3);
  const pulse = useRef(0);
  const lastStep = useRef(0);

  const { coreArgs, haloArgs } = useMemo(
    () => ({
      coreArgs: [
        {
          vertexShader: coreVert,
          fragmentShader: coreFrag,
          uniforms: {
            uTime: { value: 0 },
            uEnergy: { value: 0.3 },
            uOpacity: { value: 1 },
            uBlue: { value: BLUE },
            uViolet: { value: VIOLET },
            uGold: { value: GOLD },
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
          uniforms: { uColor: { value: new Color("#4f6bff") }, uIntensity: { value: 0.6 } },
        },
      ] as [ShaderMaterialParameters],
    }),
    []
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    let wSum = 0;
    let x = 0;
    let y = 0;
    let r = 0;
    let presence = 0;
    for (const id of ["core", "mid", "loop"]) {
      const a = frame.anchors.get(id);
      if (!a) continue;
      const w = 1 / (a.dyn * a.dyn + 0.05);
      const scale = Number(a.el.dataset.coreScale ?? 0.35);
      wSum += w;
      x += a.x * w;
      y += a.y * w;
      r += Math.min(a.w, a.h) * scale * w;
      presence = Math.max(presence, Math.exp(-a.dyn * a.dyn * 2.2));
    }
    if (!wSum) {
      g.visible = false;
      return;
    }
    x /= wSum;
    y /= wSum;
    r /= wSum;

    const loopA = frame.anchors.get("loop");
    const loopPresence = loopA ? Math.exp(-loopA.dyn * loopA.dyn * 3) : 0;
    if (universe.loopStep !== lastStep.current) {
      lastStep.current = universe.loopStep;
      pulse.current = 1;
    }
    pulse.current *= Math.exp(-frame.dt * 2.2);
    const target = 0.25 + loopPresence * 0.35 + pulse.current * 0.9 + frame.warp * 1.2 + (universe.hovered ? 0.1 : 0);
    energy.current += (target - energy.current) * (1 - Math.exp(-frame.dt * 4));

    g.visible = true;
    g.position.set(x, y, 0);
    g.scale.setScalar(r * (0.55 + 0.45 * presence));
    g.rotation.y += (frame.pointer.nx * 0.5 - g.rotation.y) * Math.min(1, frame.dt * 2.5);
    g.rotation.x += (-frame.pointer.ny * 0.3 - g.rotation.x) * Math.min(1, frame.dt * 2.5);

    const cu = coreMat.current?.uniforms;
    if (cu) {
      cu.uTime.value = frame.time;
      cu.uEnergy.value = energy.current;
      cu.uOpacity.value = 0.35 + 0.65 * presence;
    }
    const hu = haloMat.current?.uniforms;
    if (hu) {
      hu.uIntensity.value = (0.45 + energy.current * 0.5) * (0.4 + 0.6 * presence);
      (hu.uColor.value as Color).copy(BLUE).lerp(GOLD, Math.min(1, Math.max(0, energy.current - 0.55) * 1.4));
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial ref={coreMat} args={coreArgs} />
      </mesh>
      <mesh position={[0, 0, -0.6]} renderOrder={-1}>
        <planeGeometry args={[6.2, 6.2]} />
        <shaderMaterial ref={haloMat} args={haloArgs} />
      </mesh>
    </group>
  );
}
