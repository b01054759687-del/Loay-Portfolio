"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { chapters } from "@/lib/plansee";
import { PHASES } from "./unit/state";

// The unit is built in WebGL (see ./unit/UnitScene): one apartment, cutaway,
// in early-morning light — raw brick shell -> 2D layout -> plaster, floor and
// ceiling -> paint, joinery, lighting -> furnishing -> handover. It is driven
// by how far the reader has scrolled through the chapters beside it. If WebGL
// isn't available, the same five stages are shown as still photographs.
const UnitScene = dynamic(() => import("./unit/UnitScene"), { ssr: false });

const CHAPTER_IDS = chapters.map((c) => c.id);
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
  const [phase, setPhase] = useState(0);

  const fallback = (
    <div className="absolute inset-0">
      {STAGE_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === stage ? 1 : 0 }}
        >
          <Image src={src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority={i === 0} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="mb-4 min-h-[2.75rem]">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {String(stage + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-1 font-medium"
          >
            {PHASES[phase]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-[radial-gradient(ellipse_at_50%_38%,rgba(224,167,42,0.13),transparent_62%),var(--surface)]">
        <UnitScene chapterIds={CHAPTER_IDS} onPhase={setPhase} fallback={fallback} />

        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {PHASES.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === phase ? "w-6 bg-accent-warm" : i < phase ? "w-3 bg-accent-warm/50" : "w-3 bg-white/15"
                }`}
              />
            ))}
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: phase >= 6 ? 1 : 0, y: phase >= 6 ? 0 : 12 }}
            transition={{ duration: 0.6 }}
            className="hidden flex-wrap justify-end gap-3 md:flex"
          >
            {impactCallouts.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-background/85 px-4 py-3 shadow-lg backdrop-blur">
                <p className="text-metric text-xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-0.5 max-w-[10rem] text-xs leading-snug text-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
