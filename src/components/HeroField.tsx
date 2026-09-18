"use client";

import { useEffect, useRef } from "react";

// Five disciplines, five streams: each group spawns at its own edge and
// drifts toward the portrait, fading out as it arrives and a fresh node
// respawning behind it — a continuous, legible "media + creative + data +
// CRM + AI flowing into one system" rather than a uniform random field.
// Canvas 2D, not WebGL — no new rendering dependency.
const GROUP_COUNT = 5;
const NODES_PER_GROUP = 5;
const LIFETIME = 620;

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  home: { x: number; y: number };
  life: number;
  warm: boolean;
};

export default function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#4f6bff";
    const accentWarm = styles.getPropertyValue("--accent-warm").trim() || "#d7a44f";

    const LINK_DIST = 110;
    const MOUSE_RADIUS = 130;
    const DAMPING = 0.97;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let target = { x: 0, y: 0 };
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    let visible = true;

    function hexToRgba(hex: string, alpha: number) {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const int = parseInt(full, 16);
      return `rgba(${(int >> 16) & 255},${(int >> 8) & 255},${int & 255},${alpha})`;
    }

    function resize() {
      const rect = parent!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Portrait sits right-of-center on desktop, centered on mobile —
      // this is where every stream is heading.
      target = { x: width * (width > 900 ? 0.76 : 0.5), y: height * 0.42 };
    }

    // Each group gets a home arc it spawns along, so streams read as
    // distinct sources converging on one point, not one uniform cloud.
    function homeFor(group: number) {
      const angle = (group / GROUP_COUNT) * Math.PI * 1.15 + Math.PI * 0.95;
      const r = Math.min(width, height) * 0.62;
      return {
        x: target.x + Math.cos(angle) * r,
        y: target.y + Math.sin(angle) * r * 0.7,
      };
    }

    function spawn(group: number, lifeOffset: number): Node {
      const home = homeFor(group);
      const jitterX = (Math.random() - 0.5) * 80;
      const jitterY = (Math.random() - 0.5) * 80;
      return {
        x: home.x + jitterX,
        y: home.y + jitterY,
        vx: 0,
        vy: 0,
        home: { x: home.x + jitterX, y: home.y + jitterY },
        life: lifeOffset,
        warm: group === GROUP_COUNT - 1,
      };
    }

    function seed() {
      nodes = [];
      for (let g = 0; g < GROUP_COUNT; g++) {
        for (let i = 0; i < NODES_PER_GROUP; i++) {
          nodes.push(spawn(g, Math.random() * LIFETIME));
        }
      }
    }

    function lifeOpacity(life: number) {
      const t = life / LIFETIME;
      if (t < 0.12) return t / 0.12;
      if (t > 0.82) return Math.max(0, (1 - t) / 0.18);
      return 1;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            const op = Math.min(lifeOpacity(a.life), lifeOpacity(b.life));
            ctx!.strokeStyle = hexToRgba(accent, 0.14 * (1 - dist / LINK_DIST) * op);
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // The lead node of each stream draws a line into the portrait
      // itself, so the network reads as plugged in, not just floating.
      for (let g = 0; g < GROUP_COUNT; g++) {
        const group = nodes.slice(g * NODES_PER_GROUP, (g + 1) * NODES_PER_GROUP);
        let lead = group[0];
        for (const n of group) {
          if (Math.hypot(n.x - target.x, n.y - target.y) < Math.hypot(lead.x - target.x, lead.y - target.y)) {
            lead = n;
          }
        }
        const distToTarget = Math.hypot(lead.x - target.x, lead.y - target.y);
        if (distToTarget < 260) {
          const op = lifeOpacity(lead.life) * (1 - distToTarget / 260) * 0.5;
          ctx!.strokeStyle = hexToRgba(lead.warm ? accentWarm : accent, op);
          ctx!.beginPath();
          ctx!.moveTo(lead.x, lead.y);
          ctx!.lineTo(target.x, target.y);
          ctx!.stroke();
        }
      }

      nodes.forEach((n) => {
        const op = lifeOpacity(n.life);
        ctx!.fillStyle = hexToRgba(n.warm ? accentWarm : accent, 0.65 * op);
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    function step() {
      if (!visible) {
        raf = requestAnimationFrame(step);
        return;
      }
      nodes.forEach((n, idx) => {
        n.life += 1;
        if (n.life >= LIFETIME) {
          const group = Math.floor(idx / NODES_PER_GROUP);
          Object.assign(n, spawn(group, 0));
          return;
        }

        const t = n.life / LIFETIME;
        const pull = t < 0.75 ? 0.0018 : 0.006; // accelerate in on final approach
        n.vx += (target.x - n.x) * pull;
        n.vy += (target.y - n.y) * pull;

        const mdx = n.x - mouse.x;
        const mdy = n.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - mdist) / MOUSE_RADIUS;
          n.vx += (mdx / (mdist || 1)) * force * 0.5;
          n.vy += (mdy / (mdist || 1)) * force * 0.5;
        }

        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;
      });
      draw();
      raf = requestAnimationFrame(step);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onVisibility() {
      visible = !document.hidden;
    }

    resize();
    seed();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    ro.observe(parent);

    if (reduceMotion) {
      draw();
      return () => ro.disconnect();
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
}
