"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { planseeMeta, chapters, type Chapter } from "@/lib/plansee";
import { profile } from "@/lib/data";

const chapterTint: Record<string, string> = {
  before: "rgba(150,150,159,0.10)",
  "acquisition-engine": "rgba(79,107,255,0.12)",
  "intelligence-layer": "rgba(215,164,79,0.12)",
  "commercial-impact": "rgba(79,107,255,0.16)",
};

function ChapterSection({ chapter, index }: { chapter: Chapter; index: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-reveal]"),
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
        el.querySelector("[data-tint]"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 40%", toggleActions: "play reverse play reverse" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      data-chapter={chapter.id}
      className="relative border-t border-border px-6 py-24 sm:py-32"
    >
      <div
        data-tint
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: chapterTint[chapter.id] }}
      />
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-[minmax(0,220px)_1fr] gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start" data-reveal>
          <span className="text-sm text-muted tracking-[0.2em] uppercase">{chapter.kicker}</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{chapter.title}</h2>
          <span className="mt-4 block text-6xl font-semibold text-border select-none">
            0{index + 1}
          </span>
        </div>

        <div className="min-w-0">
          <p data-reveal className="text-lg text-muted leading-relaxed max-w-2xl mb-10">
            {chapter.dek}
          </p>

          <ul className="space-y-5">
            {chapter.points.map((point) => (
              <li
                key={point.label}
                data-reveal
                className="rounded-xl border border-border bg-surface p-5"
              >
                <p className="font-medium">{point.label}</p>
                {point.detail && (
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{point.detail}</p>
                )}
              </li>
            ))}
          </ul>

          {chapter.stats && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
              {chapter.stats.map((stat) => (
                <div key={stat.label} data-reveal className="bg-background p-6">
                  <p className="text-metric text-2xl sm:text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
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
        </div>
      </div>
    </section>
  );
}

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

          <p className="text-sm uppercase tracking-[0.3em] text-muted mb-4">
            {planseeMeta.client} — {planseeMeta.period}
          </p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl leading-tight">
            Building an acquisition &amp; intelligence engine from zero.
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

      {chapters.map((chapter, i) => (
        <div key={chapter.id} id={`chapter-${chapter.id}`}>
          <ChapterSection chapter={chapter} index={i} />
        </div>
      ))}

      {/* Closing */}
      <section className="px-6 py-24 sm:py-32 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
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
