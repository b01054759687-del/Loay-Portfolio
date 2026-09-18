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
          <div className="relative mx-auto w-full max-w-[380px]">
            <svg viewBox="0 0 520 520" className="w-full h-auto" aria-hidden="true">
              <path
                data-loop-full
                d="M260,70 A190,190 0 0,1 450,260 A190,190 0 0,1 260,450 A190,190 0 0,1 70,260 A190,190 0 0,1 260,70"
                fill="none"
                stroke="none"
              />
              <path
                data-loop-arc
                d="M260,70 A190,190 0 0,1 450,260"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <path
                data-loop-arc
                d="M450,260 A190,190 0 0,1 260,450"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <path
                data-loop-arc
                d="M260,450 A190,190 0 0,1 70,260"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <path
                data-loop-arc
                d="M70,260 A190,190 0 0,1 260,70"
                fill="none"
                stroke="var(--accent-warm)"
                strokeWidth="2.6"
              />

              {[
                { x: 260, y: 70, warm: false },
                { x: 450, y: 260, warm: false },
                { x: 260, y: 450, warm: false },
                { x: 70, y: 260, warm: true },
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

              <text x="260" y="252" textAnchor="middle" className="fill-foreground" style={{ fontSize: 15, fontWeight: 600 }}>
                THE LOOP
              </text>
              <text x="260" y="272" textAnchor="middle" className="fill-muted" style={{ fontSize: 11 }}>
                repeats every cycle
              </text>

              <circle data-light r="7" fill="var(--accent-warm)" opacity="0" />
            </svg>
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
