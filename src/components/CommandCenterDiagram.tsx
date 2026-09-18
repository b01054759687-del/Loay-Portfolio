"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// The homepage's operating philosophy: not a dashboard of six tool tiles,
// a repeating loop of reasoning. The six disciplines only ever appear
// inside "Connect" — as one motion, not six channels.
const stages = [
  {
    n: "01",
    id: "diagnose",
    title: "Diagnose",
    body: "What's actually broken in the business.",
  },
  {
    n: "02",
    id: "decide",
    title: "Decide",
    body: "Which lever moves it, and why.",
  },
  {
    n: "03",
    id: "connect",
    title: "Connect",
    body: "Media, creative, analytics, CRM, automation and AI — one motion, not six channels.",
  },
  {
    n: "04",
    id: "prove",
    title: "Prove",
    body: "Evidence closes the loop into the next diagnosis.",
  },
];

export default function CommandCenterDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        full: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean };
        const arcs = section.querySelectorAll<SVGPathElement>("[data-loop-arc]");
        const cards = section.querySelectorAll<HTMLElement>("[data-stage-card]");
        const light = section.querySelector<SVGCircleElement>("[data-light]");
        const loopPath = section.querySelector<SVGPathElement>("[data-loop-full]");
        const tilt = tiltRef.current;

        if (reduced) {
          gsap.set(arcs, { strokeDashoffset: 0 });
          gsap.set(cards, { opacity: 1, y: 0 });
          if (light) gsap.set(light, { opacity: 0 });
          return;
        }

        arcs.forEach((arc) => {
          const len = arc.getTotalLength();
          gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(cards, { opacity: 0, y: 20 });
        if (light) gsap.set(light, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: "top 65%" },
        });

        arcs.forEach((arc, i) => {
          tl.to(arc, { strokeDashoffset: 0, duration: 0.85, ease: "power2.inOut" }, i * 0.45);
          if (cards[i]) {
            tl.to(cards[i], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, i * 0.45 + 0.2);
          }
        });

        if (light && loopPath) {
          tl.to(light, { opacity: 1, duration: 0.4 }, "-=0.2");
          tl.to(
            light,
            {
              motionPath: { path: loopPath, align: loopPath, alignOrigin: [0.5, 0.5] },
              duration: 9,
              ease: "none",
              repeat: -1,
            },
            ">-0.1"
          );
        }

        // Depth: the loop drifts opposite the page scroll (parallax), and
        // gently tilts in 3D toward the cursor — a cheap stand-in for real
        // depth that doesn't require a WebGL scene for a static SVG loop.
        if (tilt) {
          gsap.to(tilt, {
            y: -24,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
          });

          const bounds = () => tilt.getBoundingClientRect();
          const onMove = (e: MouseEvent) => {
            const rect = bounds();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(tilt, {
              rotateY: px * 14,
              rotateX: -py * 14,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
          };
          const onLeave = () => {
            gsap.to(tilt, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
          };

          tilt.addEventListener("mousemove", onMove);
          tilt.addEventListener("mouseleave", onLeave);

          return () => {
            tilt.removeEventListener("mousemove", onMove);
            tilt.removeEventListener("mouseleave", onLeave);
          };
        }

        ScrollTrigger.refresh();
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="operating-system"
      ref={sectionRef}
      className="relative px-6 py-24 sm:py-32 border-t border-border overflow-hidden"
    >
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-muted mb-4">Operating Philosophy</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Not a dashboard &mdash; a repeating loop of reasoning.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            The same four-stage loop runs on every engagement. Six disciplines only ever act inside
            one stage of it &mdash; never as six separate channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-center">
          <div className="[perspective:800px] mx-auto w-full max-w-[380px]">
            <div ref={tiltRef} className="relative [transform-style:preserve-3d] will-change-transform">
              <svg viewBox="0 0 440 440" className="w-full h-auto" aria-hidden="true">
                <path
                  data-loop-full
                  d="M220,30 A190,190 0 0,1 410,220 A190,190 0 0,1 220,410 A190,190 0 0,1 30,220 A190,190 0 0,1 220,30"
                  fill="none"
                  stroke="none"
                />
                <path
                  data-loop-arc
                  d="M220,30 A190,190 0 0,1 410,220"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
                <path
                  data-loop-arc
                  d="M410,220 A190,190 0 0,1 220,410"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
                <path
                  data-loop-arc
                  d="M220,410 A190,190 0 0,1 30,220"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
                <path
                  data-loop-arc
                  d="M30,220 A190,190 0 0,1 220,30"
                  fill="none"
                  stroke="var(--accent-warm)"
                  strokeWidth="2.6"
                />

                {[
                  { x: 220, y: 30, warm: false },
                  { x: 410, y: 220, warm: false },
                  { x: 220, y: 410, warm: false },
                  { x: 30, y: 220, warm: true },
                ].map((node, i) => (
                  <circle
                    key={i}
                    cx={node.x}
                    cy={node.y}
                    r="6"
                    fill="var(--background)"
                    stroke={node.warm ? "var(--accent-warm)" : "var(--accent)"}
                    strokeWidth="2"
                  />
                ))}

                <text x="220" y="212" textAnchor="middle" className="fill-foreground" style={{ fontSize: 15, fontWeight: 600 }}>
                  THE LOOP
                </text>
                <text x="220" y="232" textAnchor="middle" className="fill-muted" style={{ fontSize: 11 }}>
                  repeats every cycle
                </text>

                <circle data-light r="7" fill="var(--accent-warm)" opacity="0" />
              </svg>
            </div>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stages.map((s) => (
              <li
                key={s.id}
                data-stage-card
                className="rounded-xl border border-border bg-surface p-5"
              >
                <span className="text-xs text-muted tracking-[0.2em] uppercase">{s.n}</span>
                <p className="font-medium mt-1.5">{s.title}</p>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
