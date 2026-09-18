"use client";

import Image from "next/image";
import Link from "next/link";
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,107,255,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.15] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative mb-6 h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full ring-1 ring-accent/30 shadow-[0_0_40px_-10px_rgba(79,107,255,0.35)]"
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/loay-portrait.jpg`}
          alt={profile.name}
          fill
          priority
          sizes="128px"
          className="object-cover object-top"
        />
      </motion.div>

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
            {["Media,", "Data", "&", "AI"].includes(w) ? (
              <span className="text-gradient">{w}</span>
            ) : (
              w
            )}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 max-w-2xl text-center text-base sm:text-lg text-muted leading-relaxed"
      >
        {profile.supportingText}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-10 flex flex-wrap justify-center gap-4"
      >
        <Link
          href={profile.ctaPrimary.href}
          className="px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
        >
          {profile.ctaPrimary.label}
        </Link>
        <a
          href={profile.ctaSecondary.href}
          className="px-6 py-3 rounded-full border border-border hover:border-foreground/50 transition-colors"
        >
          {profile.ctaSecondary.label}
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
