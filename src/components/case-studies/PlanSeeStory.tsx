"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { planseeMeta, chapters, type Chapter } from "@/lib/plansee";
import { profile } from "@/lib/data";
import { caseStudyIcons } from "@/lib/case-study-icons";
import PlanSeeBuildVisual from "./PlanSeeBuildVisual";

const chapterTint: Record<string, string> = {
  before: "rgba(150,150,159,0.10)",
  foundation: "rgba(79,107,255,0.10)",
  "growth-engine": "rgba(79,107,255,0.14)",
  "intelligence-layer": "rgba(215,164,79,0.12)",
  "commercial-impact": "rgba(215,164,79,0.16)",
};

function ChapterSection({ chapter }: { chapter: Chapter }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        full: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean };
        const reveals = el.querySelectorAll("[data-reveal]");
        const tint = el.querySelector("[data-tint]");

        if (reduced) {
          gsap.set(reveals, { opacity: 1, y: 0 });
          gsap.set(tint, { opacity: 1 });
          return;
        }

        gsap.fromTo(
          reveals,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 70%" },
          }
        );

        gsap.fromTo(
          tint,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 40%", toggleActions: "play reverse play reverse" },
          }
        );
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} data-chapter={chapter.id} className="relative pt-16 pb-24 sm:pb-32 border-t border-border/60">
      <div
        data-tint
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl"
        style={{ background: chapterTint[chapter.id] }}
      />
      <div data-reveal className="mb-8">
        <span className="text-sm text-muted tracking-[0.2em] uppercase">{chapter.kicker}</span>
        <h2 className="font-display mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{chapter.title}</h2>
        <span className="mt-1.5 block text-xs text-muted tracking-[0.15em] uppercase">{chapter.role}</span>
      </div>

      <p data-reveal className="text-lg text-muted leading-relaxed max-w-2xl mb-10">
        {chapter.dek}
      </p>

      <ul className="space-y-5">
        {chapter.points.map((point) => (
          <li key={point.label} data-reveal className="rounded-xl border border-border bg-surface p-5">
            <p className="font-medium">{point.label}</p>
            {point.detail && <p className="mt-1.5 text-sm text-muted leading-relaxed">{point.detail}</p>}
          </li>
        ))}
      </ul>

      {chapter.decisions && (
        <div className="mt-8 space-y-4">
          {chapter.decisions.map((d) => (
            <div
              key={d.decision}
              data-reveal
              className="rounded-xl border border-border border-l-[3px] border-l-accent-warm bg-surface overflow-hidden"
            >
              <div className="p-5 border-b border-border">
                <span className="text-xs text-accent-warm tracking-[0.15em] uppercase">Decision</span>
                <p className="mt-1.5 font-medium">{d.decision}</p>
              </div>
              <div className="p-5 border-b border-border">
                <span className="text-xs text-accent-warm tracking-[0.15em] uppercase">Why</span>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{d.why}</p>
              </div>
              <div className="p-5">
                <span className="text-xs text-accent-warm tracking-[0.15em] uppercase">Impact</span>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{d.impact}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {chapter.stats && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {chapter.stats.map((stat) => (
            <div key={stat.label} data-reveal className="bg-background p-6">
              <p className="text-metric text-2xl sm:text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {chapter.note && (
        <p data-reveal className="mt-6 text-xs text-muted leading-relaxed max-w-2xl">
          {chapter.note}
        </p>
      )}
    </section>
  );
}

const PlanSeeIcon = caseStudyIcons.plansee;

export default function PlanSeeStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const triggers = chapters.map((chapter, index) =>
      ScrollTrigger.create({
        trigger: `[data-chapter="${chapter.id}"]`,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) setActiveChapter(index);
        },
      })
    );

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* Progress rail */}
      <div className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3">
        {chapters.map((chapter, i) => (
          <a
            key={chapter.id}
            href={`#chapter-${chapter.id}`}
            className="group flex items-center gap-3"
            aria-label={`Jump to ${chapter.title}`}
          >
            <span
              className={`h-1.5 rounded-full transition-all ${
                activeChapter === i ? "w-8 bg-accent" : "w-4 bg-border group-hover:bg-muted"
              }`}
            />
          </a>
        ))}
      </div>

      {/* Intro */}
      <section className="relative px-6 pt-28 pb-20 sm:pt-36 sm:pb-28 border-b border-border">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/#case-studies"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            All case studies
          </Link>

          <p className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted mb-4">
            <PlanSeeIcon size={16} className="shrink-0" aria-hidden="true" />
            {planseeMeta.client} — {planseeMeta.period} — Interior Design &amp; Finishing
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl leading-tight">
            Blueprint becomes built space: an acquisition &amp; intelligence engine from zero.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed">
            {planseeMeta.clientDescription} Role: {planseeMeta.role}.
          </p>

          <div className="mt-10 inline-flex items-baseline gap-3 rounded-2xl border border-border bg-surface px-6 py-5">
            <span className="text-metric text-4xl font-semibold tracking-tight">
              {planseeMeta.heroStat.value}
            </span>
            <span className="text-muted max-w-xs">{planseeMeta.heroStat.label}</span>
          </div>
        </div>
      </section>

      {/* Blueprint becomes built space: one continuous illustration, pinned
          beside the chapters, that keeps constructing itself as they scroll
          rather than five separate per-scene icons. */}
      <section className="px-6 py-24 sm:py-32 border-t border-border">
        <div data-plansee-track className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start lg:h-[calc(100vh-7rem)] order-1">
            <PlanSeeBuildVisual stage={activeChapter} />
          </div>

          <div className="order-2 flex flex-col">
            {chapters.map((chapter, i) => (
              <div key={chapter.id} id={`chapter-${chapter.id}`} className={i === 0 ? "" : "mt-4"}>
                <ChapterSection chapter={chapter} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 py-24 sm:py-32 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            The same approach — media, data, and AI working as one system — applies to any growth problem.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={profile.ctaSecondary.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              {profile.ctaSecondary.label}
              <ArrowUpRight size={16} />
            </a>
            <Link
              href="/#case-studies"
              className="px-6 py-3 rounded-full border border-border hover:border-foreground/50 transition-colors"
            >
              See more case studies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
