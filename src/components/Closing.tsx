"use client";

import { motion, type Variants } from "framer-motion";
import { profile } from "@/lib/data";

const ease = [0.16, 1, 0.3, 1] as const;
const words = "Have a growth problem worth turning into a system?".split(" ");

// The in-view trigger lives on the heading, not the words: each word is
// translated out of its own overflow-hidden mask, so an observer on the word
// itself would never see it and the line would never reveal.
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const word: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: 0.9, ease } },
};

// Final act — the handoff. One question, one action.
export default function Closing() {
  return (
    <section id="contact" className="relative overflow-hidden px-6 py-32 text-center sm:py-48">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,164,79,0.16),rgba(79,107,255,0.08)_45%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-4xl">
        <p className="mb-8 text-xs uppercase tracking-[0.3em] text-muted sm:text-sm">Next signal</p>
        <motion.h2
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {words.map((w, i) => (
            <span key={i} className="mr-[0.24em] inline-block overflow-hidden pb-[0.16em] align-bottom -mb-[0.16em]">
              <motion.span variants={word} className="inline-block">
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.6 }}
          className="mt-12"
        >
          <a
            href={profile.ctaSecondary.href}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-lg font-medium text-background transition-transform hover:scale-[1.04]"
          >
            {profile.ctaSecondary.label}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
