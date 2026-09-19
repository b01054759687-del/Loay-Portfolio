"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "@/lib/data";
import HeroField from "@/components/HeroField";
import { gsap } from "@/lib/gsap";

// three.js is heavy and WebGL-only: keep it out of the initial bundle and
// off the server entirely.
const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

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
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Depth between layers: the background field drifts opposite the
  // portrait on both scroll and cursor movement, and the portrait itself
  // tilts toward the cursor — the same cheap 2D-transform technique already
  // proven in CommandCenterDiagram, reused here rather than reinvented.
  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const tilt = tiltRef.current;
    if (!section || !bg || !tilt) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const glow = section.querySelector<HTMLElement>("[data-portrait-glow]");
    if (glow) {
      gsap.to(glow, {
        opacity: 0.9,
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(bg, {
        x: px * -18,
        y: py * -12,
        duration: 0.9,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(tilt, {
        rotateY: px * 10,
        rotateX: -py * 10,
        x: px * 10,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      gsap.to(bg, { x: 0, y: 0, duration: 0.8, ease: "power3.out", overwrite: "auto" });
      gsap.to(tilt, { rotateX: 0, rotateY: 0, x: 0, duration: 0.8, ease: "power3.out", overwrite: "auto" });
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center px-6 pt-28 pb-20 overflow-hidden"
    >
      <div ref={bgRef} className="pointer-events-none absolute inset-0 -z-10 will-change-transform">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,107,255,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.15] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]" />
        <HeroField />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto]">
        <div className="relative z-10 order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-sm uppercase tracking-[0.3em] text-muted"
          >
            {profile.role}
          </motion.p>

          <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="font-display text-4xl sm:text-6xl lg:text-6xl font-semibold leading-tight tracking-tight"
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
            className="mt-8 max-w-2xl text-base sm:text-lg text-muted leading-relaxed mx-auto lg:mx-0"
          >
            {profile.supportingText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start"
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
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative order-1 mx-auto w-full max-w-[320px] sm:max-w-[380px] lg:order-2 lg:mx-0 lg:w-[380px] [perspective:1000px]"
        >
          <div ref={tiltRef} className="relative [transform-style:preserve-3d] will-change-transform">
            {/* Receives the converging streams: an ambient ring that pulses
                on its own slow cycle, so arrival at the portrait reads as
                intentional rather than the lines just stopping. */}
            <div
              data-portrait-glow
              className="pointer-events-none absolute -inset-3 rounded-[2.5rem] opacity-60"
              style={{ boxShadow: "0 0 70px 8px color-mix(in srgb, var(--accent) 35%, transparent)" }}
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] ring-1 ring-accent/30 shadow-[0_0_60px_-15px_rgba(79,107,255,0.4)]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/loay-portrait.jpg`}
                alt={profile.name}
                fill
                priority
                sizes="(min-width: 1024px) 380px, 320px"
                className="object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          </div>
          {/* Layered over the portrait; HeroScene's depth-only plane hides
              whatever orbits behind it. The -inset values are in % of the
              portrait so the scene scales with it — PORTRAIT_W/H in
              HeroScene.tsx assume exactly these (canvas = 172% x 132% of it). */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[36%] -inset-y-[16%]">
            <HeroScene />
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted"
      >
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
}
