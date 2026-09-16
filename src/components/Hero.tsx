"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "@/lib/data";

const headline = profile.tagline.split(" ");

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const word: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-accent/30 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent-2/20 blur-[100px] animate-pulse" />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-sm uppercase tracking-[0.3em] text-muted mb-6"
      >
        {profile.role}
      </motion.p>

      <motion.h1
        variants={container}
        initial="hidden"
        animate="show"
        className="text-4xl sm:text-6xl md:text-7xl font-semibold text-center max-w-4xl leading-tight tracking-tight"
      >
        {headline.map((w, i) => (
          <motion.span key={i} variants={word} className="inline-block mr-3">
            {i === headline.length - 1 ? (
              <span className="text-gradient">{w}</span>
            ) : (
              w
            )}
          </motion.span>
        ))}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-10 flex gap-4"
      >
        <a
          href="#projects"
          className="px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
        >
          View my work
        </a>
        <a
          href="#contact"
          className="px-6 py-3 rounded-full border border-border hover:border-foreground/50 transition-colors"
        >
          Get in touch
        </a>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 text-muted"
      >
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
}
