"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import ImpactMetrics from "@/components/ImpactMetrics";

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
        const pulses = section.querySelectorAll<SVGCircleElement>("[data-pulse-ring]");
        const signal = section.querySelector<SVGCircleElement>("[data-signal]");
        const sync = section.querySelector<SVGCircleElement>("[data-sync-flash]");
        const connector = section.querySelector<HTMLElement>("[data-connector-line]");
        const tilt = tiltRef.current;

        if (reduced) {
          gsap.set(arcs, { strokeDashoffset: 0 });
          gsap.set(cards, { opacity: 1, y: 0 });
          if (light) gsap.set(light, { opacity: 0 });
          if (connector) gsap.set(connector, { scaleY: 1 });
          return;
        }

        arcs.forEach((arc) => {
          const len = arc.getTotalLength();
          gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(cards, { opacity: 0, y: 20 });
        gsap.set(pulses, { attr: { r: 6 }, opacity: 0 });
        if (signal) gsap.set(signal, { attr: { r: 6 }, opacity: 0 });
        if (sync) gsap.set(sync, { attr: { r: 10 }, opacity: 0 });
        if (light) gsap.set(light, { opacity: 0 });
        if (connector) {
          gsap.set(connector, { scaleY: 0 });
          gsap.to(connector, {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: connector, start: "top 85%", end: "bottom 65%", scrub: 0.6 },
          });
        }

        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: "top 65%" },
        });

        // 1. Business signal detected — a ping at the Diagnose node before
        // anything else moves.
        if (signal) {
          tl.fromTo(
            signal,
            { attr: { r: 6 }, opacity: 0.9 },
            { attr: { r: 26 }, opacity: 0, duration: 0.55, ease: "power2.out" },
            0
          );
        }

        // 2-5. Diagnose activates -> Decide connects -> Connect synchronizes
        // -> Prove shows impact, each arc drawing in and pulsing its node
        // as it lands.
        arcs.forEach((arc, i) => {
          const t = i * 0.45 + 0.15;
          tl.to(arc, { strokeDashoffset: 0, duration: 0.85, ease: "power2.inOut" }, t);
          if (cards[i]) {
            tl.to(cards[i], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, t + 0.2);
          }
          const destination = pulses[(i + 1) % 4];
          if (destination) {
            tl.fromTo(
              destination,
              { attr: { r: 6 }, opacity: 0.85 },
              { attr: { r: 30 }, opacity: 0, duration: 0.6, ease: "power2.out" },
              t + 0.75
            );
          }
        });

        // Systems synchronized: a soft flash from the center right before
        // the loop goes into its ambient, always-on state.
        if (sync) {
          tl.fromTo(
            sync,
            { attr: { r: 10 }, opacity: 0.5 },
            { attr: { r: 170 }, opacity: 0, duration: 0.9, ease: "power2.out" },
            ">-0.1"
          );
        }

        if (light && loopPath) {
          tl.to(light, { opacity: 1, duration: 0.4 }, "-=0.5");
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

        // Alive at rest: once the activation sequence lands, the four node
        // rings keep a slow, low-amplitude breathing loop so the system
        // never reads as "finished animating" — a running system, not a
        // diagram that played once.
        const nodeCircles = section.querySelectorAll<SVGCircleElement>("[data-node-circle]");
        if (nodeCircles.length) {
          tl.to(
            nodeCircles,
            {
              attr: { r: 7.5 },
              opacity: 0.7,
              duration: 2.2,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              stagger: { each: 0.35, from: "start" },
            },
            ">-0.2"
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
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
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
                  <g key={i}>
                    <circle
                      data-pulse-ring
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill="none"
                      stroke={node.warm ? "var(--accent-warm)" : "var(--accent)"}
                      strokeWidth="1.5"
                      opacity="0"
                    />
                    <circle
                      data-node-circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill="var(--background)"
                      stroke={node.warm ? "var(--accent-warm)" : "var(--accent)"}
                      strokeWidth="2"
                    />
                  </g>
                ))}

                {/* Business signal detected — pings once at the Diagnose node before the loop starts drawing. */}
                <circle data-signal cx="220" cy="30" r="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0" />

                <text x="220" y="212" textAnchor="middle" className="fill-foreground" style={{ fontSize: 15, fontWeight: 600 }}>
                  THE LOOP
                </text>
                <text x="220" y="232" textAnchor="middle" className="fill-muted" style={{ fontSize: 11 }}>
                  repeats every cycle
                </text>

                {/* Systems synchronized — one soft flash from the center as the loop goes live. */}
                <circle data-sync-flash cx="220" cy="220" r="10" fill="none" stroke="var(--accent-warm)" strokeWidth="1" opacity="0" />

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

        {/* The connector: makes the Live Readout read as proof of THIS loop,
            not a disconnected stats section further down the page. */}
        <div className="flex flex-col items-center py-14">
          <div
            data-connector-line
            className="h-14 w-px origin-top bg-gradient-to-b from-accent-warm to-transparent"
          />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">Proven in the loop&rsquo;s own numbers</p>
        </div>

        <ImpactMetrics />
      </div>
    </section>
  );
}
