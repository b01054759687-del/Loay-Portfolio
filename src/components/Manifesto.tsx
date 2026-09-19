"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useAnchor } from "@/lib/universe";

// Act II — the premise. A pinned statement that lights up word by word as you
// scroll: the story's thesis, delivered at reading speed instead of dumped as
// a paragraph. The orb from the hero drifts behind it on its way down.
const TEXT =
  "Growth isn't a campaign. It's a system — one that diagnoses what's broken, decides what moves it, connects media, data, CRM and AI into a single motion, and proves it with evidence.";

const words = TEXT.split(" ");
const BLUE = new Set(["diagnoses", "decides", "connects"]);
const GOLD = new Set(["system", "proves"]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [10, 0]);
  const key = word.replace(/[^a-z]/gi, "").toLowerCase();
  const tone = GOLD.has(key) ? "text-accent-warm" : BLUE.has(key) ? "text-accent" : "";
  return (
    <motion.span style={{ opacity, y }} className={`mr-[0.28em] inline-block ${tone}`}>
      {word}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const midAnchor = useAnchor("mid");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="manifesto" ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen items-center px-6">
        {/* Parks the Growth Core to the right of the statement while it is read. */}
        <div
          ref={midAnchor}
          data-core-scale="0.34"
          aria-hidden="true"
          className="pointer-events-none absolute right-[5%] top-1/2 hidden aspect-square w-[min(30vw,46vh)] -translate-y-1/2 lg:block"
        />
        <div className="mx-auto w-full max-w-6xl">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-muted sm:text-sm">The premise</p>
          <p className="font-display text-[1.75rem] font-medium leading-[1.2] tracking-tight sm:text-5xl lg:max-w-[47rem] lg:text-[3.4rem]">
            {words.map((w, i) => {
              const start = 0.04 + (i / words.length) * 0.72;
              return <Word key={i} word={w} progress={scrollYProgress} range={[start, start + 0.1]} />;
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
