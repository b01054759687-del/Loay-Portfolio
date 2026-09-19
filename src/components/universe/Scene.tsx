"use client";

import { useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, type PerspectiveCamera } from "three";
import { getAnchors, universe } from "@/lib/universe";
import { BASE_FOV, BASE_Z, frame, smoothstep, type AnchorState } from "./frame";
import StarField from "./StarField";
import GrowthCore from "./GrowthCore";
import LoopRing from "./LoopRing";
import Planets from "./Planets";

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

// Runs first every frame: converts the page's DOM (scroll position, anchor
// rectangles, cursor) into world-space numbers everything else reads.
function Rig() {
  useEffect(() => {
    universe.warpTarget = 0;
    frame.warp = 0;
    frame.time = 0;
    const onMove = (e: PointerEvent) => {
      universe.pointerPx.x = e.clientX;
      universe.pointerPx.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      frame.anchors.clear();
    };
  }, []);

  useFrame(({ camera, size }, dt) => {
    const d = Math.min(dt, 0.05);
    frame.dt = d;
    if (!frame.reduced) frame.time += d;

    const cam = camera as PerspectiveCamera;
    const hWorld = 2 * Math.tan(MathUtils.degToRad(BASE_FOV / 2)) * BASE_Z;
    frame.ppu = size.height / hWorld;
    frame.vw = size.width;
    frame.vh = size.height;
    frame.scroll = window.scrollY / frame.ppu;

    frame.warp += (universe.warpTarget - frame.warp) * (1 - Math.exp(-d * 5));
    cam.position.z = BASE_Z - frame.warp * 5.5;

    const k = 1 - Math.exp(-d * 6);
    const tx = universe.pointerPx.x / size.width;
    const ty = universe.pointerPx.y / size.height;
    frame.pointer.nx += (tx * 2 - 1 - frame.pointer.nx) * k;
    frame.pointer.ny += (-(ty * 2 - 1) - frame.pointer.ny) * k;
    frame.pointer.x = frame.pointer.nx * (size.width / 2 / frame.ppu);
    frame.pointer.y = frame.pointer.ny * (size.height / 2 / frame.ppu);

    const anchors = getAnchors();
    for (const id of frame.anchors.keys()) if (!anchors.has(id)) frame.anchors.delete(id);    anchors.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) {
        frame.anchors.delete(id); // display:none at this breakpoint
        return;
      }
      let s = frame.anchors.get(id);
      if (!s) {
        s = { el, x: 0, y: 0, w: 0, h: 0, dyn: 0, top: 0, enter: 0 } as AnchorState;
        frame.anchors.set(id, s);
      }
      s.el = el;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      s.x = (cx - size.width / 2) / frame.ppu;
      s.y = -(cy - size.height / 2) / frame.ppu;
      s.w = r.width / frame.ppu;
      s.h = r.height / frame.ppu;
      s.dyn = (cy - size.height / 2) / size.height;
      s.top = r.top;
      s.enter = 1 - smoothstep(size.height * 0.72, size.height * 1.02, r.top);
    });

    const L = frame.anchors.get("loop");
    if (L) {
      frame.loop.x = L.x;
      frame.loop.y = L.y;
      frame.loop.r = 0.4 * Math.min(L.w, L.h);
      frame.loop.vis = 1 - smoothstep(0.35, 1.15, Math.abs(L.dyn));
    } else {
      frame.loop.vis = 0;
    }
  });

  return null;
}

export default function Scene() {
  const [supported] = useState(detectWebGL);
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);

  useEffect(() => {
    frame.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (supported) document.documentElement.dataset.universe = "on";
    return () => {
      delete document.documentElement.dataset.universe;
    };
  }, [supported]);

  if (!supported) return null;

  return (
    <Canvas
      frameloop="always"
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ position: [0, 0, BASE_Z], fov: BASE_FOV, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0a0a0c"]} />
      <Rig />
      <StarField count={mobile ? 6000 : 11000} />
      <GrowthCore />
      <LoopRing />
      <Planets />
    </Canvas>
  );
}
