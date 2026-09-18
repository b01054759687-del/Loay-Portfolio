"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { chapters } from "@/lib/plansee";

// A cinematic build, not five toggled icons: five real interior-finishing
// photographs of the same unit at the same fixed camera angle, crossfading
// stage by stage as the chapters scroll — from raw brick shell through 2D
// design, fit-out, finishing detail, to the furnished handover. PlanSee does
// interior finishing only (units arrive with the structural shell already
// built); the sequence never shows structural/exterior construction.
const STAGE_LABELS = chapters.map((c) => c.title);
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const STAGE_IMAGES = [
  `${BASE_PATH}/images/plansee/stage-0-empty-space.webp`,
  `${BASE_PATH}/images/plansee/stage-1-foundation.webp`,
  `${BASE_PATH}/images/plansee/stage-2-growth-engine.webp`,
  `${BASE_PATH}/images/plansee/stage-3-intelligence-layer.webp`,
  `${BASE_PATH}/images/plansee/stage-4-commercial-impact.webp`,
];

// Verified stat callouts for the closing scene, read straight from
// plansee.ts's own commercial-impact chapter — never restated by hand, so
// this visual can't drift from the sourced numbers.
const impactCallouts = (chapters[chapters.length - 1].stats ?? []).slice(0, 2);

export default function PlanSeeBuildVisual({ stage }: { stage: number }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Reduced motion: no scroll scrubbing — just snap layers to the current
  // chapter's cumulative built state, same discipline as the rest of the site.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(root.querySelectorAll<HTMLDivElement>("[data-stage-layer]"));
    layers.forEach((layer, i) => gsap.set(layer, { opacity: i <= stage ? 1 : 0 }));

    const callouts = root.querySelector<HTMLDivElement>("[data-impact-callouts]");
    const atFinal = stage >= chapters.length - 1;
    if (callouts) gsap.set(callouts, { opacity: atFinal ? 1 : 0, y: atFinal ? 0 : 12 });
  }, [stage]);

  // Full motion: one scroll-scrubbed ScrollTrigger per chapter, crossfading
  // this visual's photo layers off the same chapter sections the text
  // column scrolls through — set up once on mount, independent of the
  // discrete `stage` prop.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const layers = Array.from(root.querySelectorAll<HTMLDivElement>("[data-stage-layer]"));
      const callouts = root.querySelector<HTMLDivElement>("[data-impact-callouts]");

      gsap.set(layers[0], { opacity: 1, scale: 1 });
      gsap.set(layers.slice(1), { opacity: 0, scale: 1.03 });
      if (callouts) gsap.set(callouts, { opacity: 0, y: 12 });

      // Resolved via plain document.querySelector, not gsap's own selector
      // text — inside gsap.context(fn, root), any selector STRING passed to
      // ScrollTrigger's `trigger` gets scoped to root's descendants, and
      // these chapter sections live in a sibling column, not under root.
      // Passing already-resolved elements sidesteps that scoping entirely.
      const chapterEls = chapters.map((c) => document.querySelector<HTMLElement>(`[data-chapter="${c.id}"]`));

      chapterEls.forEach((el, i) => {
        if (i === 0 || !el) return; // layer 0 is the resting base photo
        const layer = layers[i];
        if (!layer) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => {
            gsap.set(layer, { opacity: self.progress, scale: 1.03 - self.progress * 0.03 });
          },
        });
      });

      // Evidence cards dock onto the finished interior as the last chapter
      // resolves — numbers arriving with the delivered space, not before it.
      const lastEl = chapterEls[chapterEls.length - 1];
      if (lastEl && callouts) {
        ScrollTrigger.create({
          trigger: lastEl,
          start: "top 60%",
          end: "bottom center",
          scrub: 0.6,
          onUpdate: (self) => gsap.set(callouts, { opacity: self.progress, y: 12 - self.progress * 12 }),
        });
      }

      // Slow ambient drift on the base photo so the resting state reads as
      // alive, not a static picture, before any scroll happens.
      gsap.to(layers[0], { scale: 1.06, duration: 20, ease: "sine.inOut", repeat: -1, yoyo: true });

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
        <div className="absolute inset-0" aria-hidden="true">
          {STAGE_IMAGES.map((src, i) => (
            <div key={src} data-stage-layer className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/10" />

        <div
          data-impact-callouts
          className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap gap-3 opacity-0"
        >
          {impactCallouts.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-background/90 backdrop-blur px-4 py-3 shadow-lg"
            >
              <p className="text-metric text-xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted leading-snug max-w-[10rem]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
