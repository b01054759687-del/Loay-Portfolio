"use client";

import { useEffect, useRef } from "react";

// Ambient canvas backdrop: a loose network of nodes drifting in a weak
// orbit around the hero's center (where the portrait sits) with gentle
// mouse repulsion. This is the visual argument for "disciplines converge
// into one system" — no labels needed, the motion itself is the claim.
// Canvas 2D, not WebGL: the same read as a particle-network hero without
// a new rendering dependency on a static-export portfolio site.
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

    const NODE_COUNT = 22;
    const LINK_DIST = 120;
    const MOUSE_RADIUS = 130;
    const CENTER_PULL = 0.0007;
    const DAMPING = 0.996;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: { x: number; y: number; vx: number; vy: number; warm: boolean }[] = [];
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
    }

    function seed() {
      nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        warm: i % 5 === 0,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx!.strokeStyle = hexToRgba(accent, 0.14 * (1 - dist / LINK_DIST));
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx!.fillStyle = hexToRgba(n.warm ? accentWarm : accent, 0.6);
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.7, 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    function step() {
      if (!visible) {
        raf = requestAnimationFrame(step);
        return;
      }
      const cx = width / 2;
      const cy = height / 2;
      nodes.forEach((n) => {
        n.vx += (cx - n.x) * CENTER_PULL;
        n.vy += (cy - n.y) * CENTER_PULL;

        const mdx = n.x - mouse.x;
        const mdy = n.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - mdist) / MOUSE_RADIUS;
          n.vx += (mdx / (mdist || 1)) * force * 0.4;
          n.vy += (mdy / (mdist || 1)) * force * 0.4;
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
