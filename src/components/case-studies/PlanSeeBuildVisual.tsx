"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { chapters } from "@/lib/plansee";

// A cinematic build, not five toggled icons. Each chapter scrubs its own
// layer continuously with scroll position — blueprint draws in, the
// structure rises through a mask wipe, marketing/data layers connect in,
// the finished space warms up — so this reads as one system assembling
// itself, not a slideshow. Still hand-drawn/stylised, not a real floor
// plan: no real project assets exist, and none are fabricated here.
const STAGE_LABELS = chapters.map((c) => c.title);

// Verified stat callouts for the closing scene, read straight from
// plansee.ts's own commercial-impact chapter — never restated by hand, so
// this visual can't drift from the sourced numbers.
const impactCallouts = (chapters[chapters.length - 1].stats ?? []).slice(0, 2);

const GROWTH_NODES = [
  { x: 65, y: 260, label: "Acquisition" },
  { x: 415, y: 260, label: "Creative Testing" },
  { x: 240, y: 100, label: "Optimization" },
];

export default function PlanSeeBuildVisual({ stage }: { stage: number }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Reduced motion: no scroll scrubbing — just snap layers to the current
  // chapter's cumulative built state, same discipline as the rest of the site.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blueprint = root.querySelector<SVGGElement>("[data-layer-blueprint]");
    const maskRect = root.querySelector<SVGRectElement>("[data-structure-mask]");
    const growth = root.querySelector<SVGGElement>("[data-layer-growth]");
    const intelligence = root.querySelector<SVGGElement>("[data-layer-intelligence]");
    const impact = root.querySelector<SVGGElement>("[data-layer-impact]");

    gsap.set(blueprint, { opacity: stage === 0 ? 1 : 0.15 });
    if (maskRect) gsap.set(maskRect, { attr: { y: stage >= 1 ? 140 : 560, height: stage >= 1 ? 420 : 0 } });
    gsap.set(growth, { opacity: stage >= 2 ? 1 : 0 });
    gsap.set(intelligence, { opacity: stage >= 3 ? 1 : 0 });
    gsap.set(impact, { opacity: stage >= 4 ? 1 : 0 });
  }, [stage]);

  // Full motion: one scroll-scrubbed ScrollTrigger per chapter, driving this
  // visual's layers off the same chapter sections the text column scrolls
  // through — set up once on mount, independent of the discrete `stage` prop.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const blueprint = root.querySelector<SVGGElement>("[data-layer-blueprint]");
      const maskRect = root.querySelector<SVGRectElement>("[data-structure-mask]");
      const growth = root.querySelector<SVGGElement>("[data-layer-growth]");
      const intelligence = root.querySelector<SVGGElement>("[data-layer-intelligence]");
      const impact = root.querySelector<SVGGElement>("[data-layer-impact]");
      const pulses = root.querySelectorAll<SVGCircleElement>("[data-intel-pulse]");
      const parallaxBack = root.querySelector<SVGGElement>("[data-parallax-back]");
      const parallaxFront = root.querySelector<SVGGElement>("[data-parallax-front]");

      const blueprintLines = Array.from(root.querySelectorAll<SVGGeometryElement>("[data-blueprint-line]"));
      const growthLines = Array.from(root.querySelectorAll<SVGGeometryElement>("[data-growth-line]"));
      const blueprintLengths = blueprintLines.map((line) => line.getTotalLength());
      const growthLengths = growthLines.map((line) => line.getTotalLength());

      blueprintLines.forEach((line, i) => gsap.set(line, { strokeDasharray: blueprintLengths[i], strokeDashoffset: blueprintLengths[i] }));
      growthLines.forEach((line, i) => gsap.set(line, { strokeDasharray: growthLengths[i], strokeDashoffset: growthLengths[i] }));

      gsap.set(blueprint, { opacity: 0 });
      gsap.set([growth, intelligence, impact], { opacity: 0 });
      if (maskRect) gsap.set(maskRect, { attr: { y: 560, height: 0 } });

      // Resolved via plain document.querySelector, not gsap's own selector
      // text — inside gsap.context(fn, root), any selector STRING passed to
      // ScrollTrigger's `trigger` gets scoped to root's descendants, and
      // these chapter sections live in a sibling column, not under root.
      // Passing already-resolved elements sidesteps that scoping entirely.
      const chapterEls = chapters.map((c) => document.querySelector<HTMLElement>(`[data-chapter="${c.id}"]`));

      // Scene 1 — Empty Space: the blueprint draws itself onto nothing.
      if (chapterEls[0]) {
        ScrollTrigger.create({
          trigger: chapterEls[0],
          start: "top bottom",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => {
            gsap.set(blueprint, { opacity: self.progress });
            blueprintLines.forEach((line, i) => {
              gsap.set(line, { strokeDashoffset: blueprintLengths[i] * (1 - self.progress) });
            });
          },
        });
      }

      // Scene 2 — Foundation: blueprint fades as the structure rises
      // bottom-up through a mask wipe, not a crossfade.
      if (chapterEls[1]) {
        ScrollTrigger.create({
          trigger: chapterEls[1],
          start: "top bottom",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(blueprint, { opacity: Math.max(0.12, 1 - p) });
            if (maskRect) {
              const h = 420 * p;
              gsap.set(maskRect, { attr: { y: 560 - h, height: h } });
            }
          },
        });
      }

      // Scene 3 — Growth Engine: acquisition / creative testing /
      // optimization connect into the built space.
      if (chapterEls[2]) {
        ScrollTrigger.create({
          trigger: chapterEls[2],
          start: "top bottom",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => {
            gsap.set(growth, { opacity: self.progress });
            growthLines.forEach((line, i) => {
              gsap.set(line, { strokeDashoffset: growthLengths[i] * (1 - self.progress) });
            });
          },
        });
      }

      // Scene 4 — Intelligence Layer: windows and data pulses activate.
      if (chapterEls[3]) {
        ScrollTrigger.create({
          trigger: chapterEls[3],
          start: "top bottom",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => gsap.set(intelligence, { opacity: self.progress }),
        });
      }

      // Scene 5 — Commercial Impact: warm occupied fill, verified numbers.
      if (chapterEls[4]) {
        ScrollTrigger.create({
          trigger: chapterEls[4],
          start: "top bottom",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => gsap.set(impact, { opacity: self.progress }),
        });
      }

      if (pulses.length) {
        gsap.to(pulses, {
          opacity: 0.9,
          scale: 1.4,
          transformOrigin: "center",
          duration: 1.1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.25,
        });
      }

      // Depth: background (blueprint) and foreground (growth/intelligence/
      // impact) drift at different rates across the whole reading span —
      // cheap 2D parallax, no WebGL.
      const track = document.querySelector<HTMLElement>("[data-plansee-track]");
      if (track && parallaxBack && parallaxFront) {
        gsap.to(parallaxBack, {
          y: -18,
          ease: "none",
          scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        gsap.to(parallaxFront, {
          y: 14,
          ease: "none",
          scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
      }

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

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
          <defs>
            <mask id="structure-reveal">
              <rect x="0" y="0" width="480" height="620" fill="black" />
              <rect data-structure-mask x="70" y="560" width="340" height="0" fill="white" />
            </mask>
          </defs>

          <rect x="0" y="0" width="480" height="620" fill="var(--surface)" />

          <g data-parallax-back>
            <line x1="30" y1="560" x2="450" y2="560" stroke="var(--border)" strokeWidth="1.5" />

            {/* Scene 1 — blueprint grid, drawn in, not just faded in */}
            <g data-layer-blueprint>
              <rect data-blueprint-line x="70" y="140" width="340" height="420" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="7 6" />
              <line data-blueprint-line x1="240" y1="140" x2="240" y2="560" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
              <line data-blueprint-line x1="70" y1="350" x2="410" y2="350" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
              <circle cx="330" cy="200" r="16" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
              <line x1="330" y1="184" x2="330" y2="216" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
              <line x1="314" y1="200" x2="346" y2="200" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
            </g>
          </g>

          {/* Scene 2 — structure, revealed bottom-up through a mask wipe */}
          <g data-layer-structure mask="url(#structure-reveal)">
            <rect x="70" y="536" width="340" height="24" fill="var(--accent)" opacity="0.18" />
            {[110, 170, 230, 290, 350, 400].map((x) => (
              <line key={x} x1={x} y1="536" x2={x} y2="560" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
            ))}
            <rect x="90" y="260" width="300" height="276" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <polyline points="80,260 240,190 400,260" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <line x1="240" y1="330" x2="240" y2="536" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
          </g>

          <g data-parallax-front>
            {/* Scene 3 — growth layer: marketing disciplines connecting in */}
            <g data-layer-growth>
              {GROWTH_NODES.map((n) => (
                <g key={n.label}>
                  <line data-growth-line x1={n.x} y1={n.y} x2="240" y2="300" stroke="var(--accent-warm)" strokeWidth="1.2" opacity="0.7" />
                  <circle cx={n.x} cy={n.y} r="9" fill="var(--surface)" stroke="var(--accent-warm)" strokeWidth="1.6" />
                  <text x={n.x} y={n.y - 16} textAnchor="middle" className="fill-muted" style={{ fontSize: 8, letterSpacing: 0.4 }}>
                    {n.label.toUpperCase()}
                  </text>
                </g>
              ))}
            </g>

            {/* Scene 4 — intelligence layer: windows + data pulses activate */}
            <g data-layer-intelligence>
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
              <circle data-intel-pulse cx="198" cy="323" r="3" fill="var(--accent-warm)" opacity="0.7" />
              <circle data-intel-pulse cx="378" cy="323" r="3" fill="var(--accent-warm)" opacity="0.7" />
              <circle data-intel-pulse cx="240" cy="450" r="3" fill="var(--accent-warm)" opacity="0.7" />
            </g>

            {/* Scene 5 — commercial impact: warm occupied fill + verified numbers */}
            <g data-layer-impact>
              <rect x="92" y="262" width="296" height="272" fill="var(--accent-warm)" opacity="0.1" />
              <rect x="210" y="440" width="60" height="96" fill="var(--accent-warm)" opacity="0.8" />
              <circle cx="200" cy="500" r="6" fill="var(--foreground)" opacity="0.6" />
              <circle cx="290" cy="510" r="6" fill="var(--foreground)" opacity="0.6" />
              <rect x="185" y="506" width="4" height="20" fill="var(--foreground)" opacity="0.5" />
              <rect x="275" y="516" width="4" height="20" fill="var(--foreground)" opacity="0.5" />

              {impactCallouts.map((stat, i) => (
                <g key={stat.label} transform={`translate(${i === 0 ? 20 : 330}, 36)`}>
                  <rect width="130" height="50" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
                  <text x="12" y="22" className="fill-foreground" style={{ fontSize: 15, fontWeight: 600 }}>
                    {stat.value}
                  </text>
                  <text x="12" y="37" className="fill-muted" style={{ fontSize: 7.5 }}>
                    {stat.label}
                  </text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
