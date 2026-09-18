"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { chapters } from "@/lib/plansee";

// One continuous illustration, not five separate icons. Stylised, not a
// real floor plan — Loay confirmed the story matters more than photographic
// accuracy here, so this stays hand-drawn rather than waiting on real
// project assets. Each group is cumulative: once a stage is reached it
// stays built, the same way the actual engagement did.
const STAGE_LABELS = chapters.map((c) => c.title);

export default function PlanSeeBuildVisual({ stage }: { stage: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = reducedRef.current;

    for (let s = 1; s <= 4; s++) {
      const group = root.querySelector<SVGGElement>(`[data-build-stage="${s}"]`);
      if (!group) continue;
      const on = stage >= s;
      if (reduced) {
        gsap.set(group, { opacity: on ? 1 : 0 });
      } else {
        gsap.to(group, { opacity: on ? 1 : 0, duration: 0.9, ease: "power2.inOut" });
      }
    }

    const plot = root.querySelector<SVGRectElement>("[data-plot]");
    if (plot) {
      const target = stage >= 4 ? 0 : 1;
      if (reduced) gsap.set(plot, { strokeDashoffset: 0, opacity: stage >= 1 ? 0 : 1 });
      else gsap.to(plot, { opacity: target === 0 ? 0 : 1, duration: 0.9 });
    }
  }, [stage]);

  return (
    <div ref={rootRef} className="relative w-full h-full flex flex-col">
      <div className="mb-4">
        <span className="text-xs text-muted tracking-[0.2em] uppercase">
          {String(stage + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
        </span>
        <p className="mt-1 font-medium">{STAGE_LABELS[stage]}</p>
      </div>

      <div className="relative flex-1 rounded-2xl border border-border bg-surface overflow-hidden">
        <svg viewBox="0 0 480 620" className="w-full h-full" aria-hidden="true">
          {/* sky wash */}
          <rect x="0" y="0" width="480" height="620" fill="var(--surface)" />

          {/* ground */}
          <line x1="30" y1="560" x2="450" y2="560" stroke="var(--border)" strokeWidth="1.5" />

          {/* empty plot boundary — present until the slab is poured */}
          <rect
            data-plot
            x="70"
            y="140"
            width="340"
            height="420"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1.5"
            strokeDasharray="7 6"
          />

          {/* stage 1 — foundation slab */}
          <g data-build-stage="1" opacity="0">
            <rect x="70" y="536" width="340" height="24" fill="var(--accent)" opacity="0.18" />
            {[110, 170, 230, 290, 350, 400].map((x) => (
              <line key={x} x1={x} y1="536" x2={x} y2="560" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
            ))}
          </g>

          {/* stage 2 — walls + roofline */}
          <g data-build-stage="2" opacity="0">
            <rect x="90" y="260" width="300" height="276" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <polyline points="80,260 240,190 400,260" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <line x1="240" y1="330" x2="240" y2="536" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
          </g>

          {/* stage 3 — windows, most dark, two lit (visibility / data coming online) */}
          <g data-build-stage="3" opacity="0">
            {[
              { x: 120, y: 300, lit: false },
              { x: 180, y: 300, lit: true },
              { x: 300, y: 300, lit: false },
              { x: 360, y: 300, lit: true },
              { x: 120, y: 400, lit: false },
              { x: 300, y: 400, lit: false },
            ].map((w, i) => (
              <rect
                key={i}
                x={w.x}
                y={w.y}
                width="36"
                height="46"
                fill={w.lit ? "var(--accent-warm)" : "var(--surface-2)"}
                fillOpacity={w.lit ? 0.85 : 1}
                stroke="var(--accent)"
                strokeWidth="1.2"
              />
            ))}
          </g>

          {/* stage 4 — finished, occupied: warm fill, lit doorway, figures */}
          <g data-build-stage="4" opacity="0">
            <rect x="92" y="262" width="296" height="272" fill="var(--accent-warm)" opacity="0.1" />
            <rect x="210" y="440" width="60" height="96" fill="var(--accent-warm)" opacity="0.8" />
            <circle cx="200" cy="500" r="6" fill="var(--ink, var(--foreground))" opacity="0.6" />
            <circle cx="290" cy="510" r="6" fill="var(--ink, var(--foreground))" opacity="0.6" />
            <rect x="185" y="506" width="4" height="20" fill="var(--foreground)" opacity="0.5" />
            <rect x="275" y="516" width="4" height="20" fill="var(--foreground)" opacity="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}
