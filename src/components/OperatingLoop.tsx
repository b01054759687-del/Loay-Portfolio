"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { universe, useAnchor } from "@/lib/universe";

const ease = [0.16, 1, 0.3, 1] as const;

// The homepage's operating philosophy, told as a pinned scroll sequence: the
// ring on the right is WebGL (its lit arc *is* the scroll position), the copy
// on the left advances with it. Six disciplines only ever appear inside
// "Connect" — as one motion, not separate channels.
const stages = [
  { id: "diagnose", kicker: "The signal", title: "Diagnose", body: "What's actually broken in the business." },
  { id: "decide", kicker: "The lever", title: "Decide", body: "Which lever moves it, and why." },
  {
    id: "connect",
    kicker: "The system",
    title: "Connect",
    body: "Media, creative, analytics, CRM, automation and AI — one motion, not separate channels.",
  },
  { id: "prove", kicker: "The proof", title: "Prove", body: "Evidence closes the loop into the next diagnosis." },
];

const disciplines = ["Media", "Creative", "Analytics", "CRM", "Automation", "AI"];

const labelPos = [
  "left-1/2 top-[10%] mt-14 -translate-x-1/2",
  "right-[10%] top-1/2 mr-16 -translate-y-1/2",
  "left-1/2 bottom-[10%] mb-14 -translate-x-1/2",
  "left-[10%] top-1/2 ml-16 -translate-y-1/2",
];

export default function OperatingLoop() {
  const sectionRef = useRef<HTMLElement>(null);
  const loopAnchor = useAnchor("loop");
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const sync = (v: number) => {
    const p = Math.min(1, Math.max(0, v));
    universe.loopProgress = p;
    const s = Math.min(3, Math.floor(p * 4));
    universe.loopStep = s;
    setStep(s);
  };

  useMotionValueEvent(scrollYProgress, "change", sync);

  useEffect(() => {
    return () => {
      universe.loopProgress = 0;
      universe.loopStep = 0;
    };
  }, []);

  const current = stages[step];

  return (
    <section id="operating-system" ref={sectionRef} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen items-center px-6 pt-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-4 lg:grid-cols-2 lg:gap-10">
          <div className="order-2 lg:order-1">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted sm:text-sm">Operating philosophy</p>
            <h2 className="font-display text-xl font-semibold leading-snug tracking-tight sm:text-3xl lg:text-4xl">
              Not a dashboard &mdash; a repeating loop of reasoning.
            </h2>

            <div className="mt-6 min-h-[11.5rem] sm:mt-10 sm:min-h-[15rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-accent-warm">{current.kicker}</p>
                  <p className="font-display mt-2 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                    {current.title}
                  </p>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">{current.body}</p>
                  {current.id === "connect" && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {disciplines.map((d, i) => (
                        <motion.span
                          key={d}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease, delay: 0.15 + i * 0.06 }}
                          className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-foreground"
                        >
                          {d}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center gap-2" aria-hidden="true">
              {stages.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === step ? "w-10 bg-accent-warm" : i < step ? "w-6 bg-accent" : "w-6 bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            ref={loopAnchor}
            data-core-scale="0.13"
            className="relative order-1 mx-auto aspect-square w-[min(78vw,38vh)] lg:order-2 lg:w-[min(44vw,66vh)]"
          >
            <div className="universe-fallback absolute inset-[10%] rounded-full border border-accent/40" />
            {stages.map((s, i) => (
              <span
                key={s.id}
                className={`pointer-events-none absolute hidden text-[10px] uppercase tracking-[0.25em] [text-shadow:0_0_14px_#0a0a0c,0_0_4px_#0a0a0c] transition-all duration-500 sm:block sm:text-xs ${labelPos[i]} ${
                  i === step ? "scale-110 text-foreground" : "text-muted/60"
                }`}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
