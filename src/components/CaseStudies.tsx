"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { caseStudies, type CaseStudy } from "@/lib/data";
import { caseStudyIcons } from "@/lib/case-study-icons";
import { worldMotifs } from "@/lib/world-motifs";
import { universe, useAnchor } from "@/lib/universe";
import type { WorldEnterDetail } from "@/components/WorldTransitionOverlay";

const ease = [0.16, 1, 0.3, 1] as const;

// How long the camera dive + wash-in plays before the route actually changes
// underneath it — must stay in step with WorldTransitionOverlay's wash-in.
const TRANSITION_MS = 380;

function WorldCard({ study, featured }: { study: CaseStudy; featured: boolean }) {
  const router = useRouter();
  const anchor = useAnchor(`world:${study.slug}`);
  const Icon = caseStudyIcons[study.slug];
  const live = study.status === "live";

  function enterWorld(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let modified clicks behave normally
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // plain navigation
    e.preventDefault();
    universe.warpTarget = 1;
    window.dispatchEvent(new CustomEvent<WorldEnterDetail>("growth-world-enter", { detail: { slug: study.slug } }));
    window.setTimeout(() => router.push(study.href), TRANSITION_MS);
  }

  const wake = () => {
    universe.hovered = study.slug;
  };
  const sleep = () => {
    if (universe.hovered === study.slug) universe.hovered = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease }}
      className={featured ? "lg:col-span-2" : ""}
    >
      <Link
        href={study.href}
        onClick={enterWorld}
        onPointerEnter={wake}
        onPointerLeave={sleep}
        onFocus={wake}
        onBlur={sleep}
        className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 transition-colors duration-500 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className={featured ? "lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center" : ""}>
          {/* Empty on purpose: the planet is drawn here by the WebGL canvas
              behind the page, pinned to this box. The motif is only a
              stand-in when WebGL isn't running. */}
          <div
            ref={anchor}
            className={`relative ${featured ? "aspect-[4/3] lg:aspect-[5/4]" : "aspect-[16/11]"}`}
          >
            <div className="universe-fallback absolute inset-6 opacity-70">{worldMotifs[study.slug]}</div>
          </div>

          <div className="relative bg-gradient-to-t from-background/80 via-background/40 to-transparent p-7 sm:p-9 lg:data-[featured=true]:bg-none" data-featured={featured}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted sm:text-sm">
                {Icon && <Icon size={14} className="shrink-0" aria-hidden="true" />}
                {study.client}
              </span>
              {live ? (
                <span className="rounded-full bg-accent-warm/15 px-2.5 py-1 text-xs text-accent-warm">Live world</span>
              ) : (
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-muted">
                  Opening soon
                </span>
              )}
            </div>

            <h3 className={`font-display font-semibold leading-snug tracking-tight ${featured ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>
              {study.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{study.oneLiner}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {study.focus.map((f) => (
                <span key={f} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted">
                  {f}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-muted transition-all duration-300 group-hover:text-foreground">
              Enter world
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CaseStudies() {
  return (
    <section id="case-studies" className="relative px-6 py-24 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl sm:mb-20">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted sm:text-sm">Choose a Growth World</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Different business, different world &mdash; same operating system.
          </h2>
          <p className="mt-5 leading-relaxed text-muted">
            Each world is a real business environment Loay built a growth system inside &mdash; the constraint, the
            build, and the measured outcome, not a campaign screenshot. Hover one to wake it. Step inside to see how it
            was built.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {caseStudies.map((study, i) => (
            <WorldCard key={study.slug} study={study} featured={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
