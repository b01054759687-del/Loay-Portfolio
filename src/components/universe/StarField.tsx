"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type ShaderMaterial, type ShaderMaterialParameters } from "three";
import { frame } from "./frame";
import { starFrag, starVert } from "./shaders";

const FIELD_H = 26;

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function StarField({ count }: { count: number }) {
  const mat = useRef<ShaderMaterial>(null);

  const { positions, data, sizes, colors, args } = useMemo(() => {
    const rand = mulberry32(11);
    const positions = new Float32Array(count * 3);
    const data = new Float32Array(count * 4);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 46;
      positions[i * 3 + 1] = (rand() - 0.5) * FIELD_H;
      positions[i * 3 + 2] = -14 + rand() * 18;
      data[i * 4] = rand();
      data[i * 4 + 1] = rand();
      data[i * 4 + 2] = rand() * Math.PI * 2;
      data[i * 4 + 3] = rand() * 2 - 1;
      sizes[i] = 0.6 + rand() * rand() * 2.2;
      const warm = rand() < 0.1;
      const tint = 0.75 + rand() * 0.25;
      colors[i * 3] = warm ? 0.84 : 0.62 * tint;
      colors[i * 3 + 1] = warm ? 0.64 : 0.72 * tint;
      colors[i * 3 + 2] = warm ? 0.31 : 1.0 * tint;
    }
    return {
      positions,
      data,
      sizes,
      colors,
      args: [
        {
          vertexShader: starVert,
          fragmentShader: starFrag,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uWarp: { value: 0 },
            uMorph: { value: 0 },
            uPx: { value: 1 },
            uRingR: { value: 1 },
            uPointerOn: { value: 1 },
            uH: { value: FIELD_H },
            uPointer: { value: [0, 0] },
            uRingC: { value: [0, 0, 0] },
          },
        },
      ] as [ShaderMaterialParameters],
    };
  }, [count]);

  useFrame(({ gl }) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = frame.time;
    u.uScroll.value = frame.scroll;
    u.uWarp.value = frame.warp;
    u.uMorph.value = frame.loop.vis;
    u.uPx.value = gl.getPixelRatio();
    u.uRingR.value = frame.loop.r;
    u.uPointerOn.value = frame.reduced ? 0 : 1;
    u.uPointer.value = [frame.pointer.x, frame.pointer.y];
    u.uRingC.value = [frame.loop.x, frame.loop.y, 0];
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aData" args={[data, 4]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} args={args} />
    </points>
  );
}
