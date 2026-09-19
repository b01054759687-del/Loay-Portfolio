"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { profile } from "@/lib/data";
import { useAnchor } from "@/lib/universe";

const ease = [0.16, 1, 0.3, 1] as const;
const headline = profile.tagline.split(" ");
const accentWords = new Set(["Media,", "Data", "&", "AI"]);

// Act I — the signal. No portrait, no numbers: the headline arrives through
// a masked line reveal while the Growth Core (a WebGL orb pinned to the
// anchor on the right) breathes and follows the cursor.
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const coreAnchor = useAnchor("core");
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center px-6 pt-24 pb-20"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 order-2 text-center lg:order-1 lg:text-left"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-7 inline-flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted sm:text-sm sm:tracking-[0.3em]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {profile.role}
          </motion.p>

          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {headline.map((w, i) => (
              <span key={i} className="mr-[0.24em] inline-block overflow-hidden pb-[0.16em] align-bottom -mb-[0.16em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: "115%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease, delay: 0.25 + i * 0.07 }}
                >
                  {accentWords.has(w) ? <span className="text-gradient">{w}</span> : w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.9 }}
            className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0"
          >
            {profile.supportingText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 1.1 }}
            className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start"
          >
            <Link
              href={profile.ctaPrimary.href}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-medium text-background transition-transform hover:scale-[1.03]"
            >
              {profile.ctaPrimary.label}
              <span className="transition-transform group-hover:translate-y-0.5">↓</span>
            </Link>
            <a
              href={profile.ctaSecondary.href}
              className="rounded-full border border-white/15 px-6 py-3 backdrop-blur-sm transition-colors hover:border-foreground/50"
            >
              {profile.ctaSecondary.label}
            </a>
          </motion.div>
        </motion.div>

        <div
          ref={coreAnchor}
          data-core-scale="0.36"
          className="relative order-1 mx-auto aspect-square w-[min(68vw,38vh)] lg:order-2 lg:w-full lg:max-w-[520px]"
        >
          <div className="universe-fallback absolute inset-[14%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#7a5cff,#4f6bff_45%,#0a0a0c_78%)] shadow-[0_0_120px_20px_rgba(79,107,255,0.35)]" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted"
      >
        <span>Scroll to assemble the system</span>
        <motion.span
          animate={{ scaleY: [0.2, 1, 0.2], originY: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-px bg-gradient-to-b from-accent to-transparent"
        />
      </motion.div>
    </section>
  );
}
