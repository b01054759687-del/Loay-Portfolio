"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { caseStudies } from "@/lib/data";
import { caseStudyIcons } from "@/lib/case-study-icons";
import { worldMotifs } from "@/lib/world-motifs";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { WorldEnterDetail } from "@/components/WorldTransitionOverlay";

// How long the wash-in plays before the route actually changes underneath
// it — must stay in step with WorldTransitionOverlay's own wash-in duration.
const TRANSITION_MS = 380;

export default function CaseStudies() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  function enterWorld(e: React.MouseEvent, slug: string, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let modified clicks behave normally
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // plain navigation
    e.preventDefault();
    window.dispatchEvent(new CustomEvent<WorldEnterDetail>("growth-world-enter", { detail: { slug } }));
    window.setTimeout(() => router.push(href), TRANSITION_MS);
  }

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        full: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean };
        const cards = section.querySelectorAll<HTMLElement>("[data-world-card]");
        const lines = section.querySelectorAll<SVGGeometryElement>("[data-reveal-line]");

        if (reduced) {
          gsap.set(cards, { opacity: 1, y: 0 });
          gsap.set(lines, { strokeDashoffset: 0 });
          return;
        }

        gsap.set(cards, { opacity: 0, y: 28 });

        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: section, start: "top 78%" },
        });

        cards.forEach((card) => {
          const cardLines = card.querySelectorAll<SVGGeometryElement>("[data-reveal-line]");
          cardLines.forEach((line) => {
            const len = line.getTotalLength();
            gsap.fromTo(
              line,
              { strokeDasharray: len, strokeDashoffset: len },
              {
                strokeDashoffset: 0,
                duration: 1,
                ease: "power2.inOut",
                scrollTrigger: { trigger: card, start: "top 80%" },
              }
            );
          });
        });

        ScrollTrigger.refresh();
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section id="case-studies" ref={sectionRef} className="px-6 py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-muted mb-4">Choose a Growth World</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Different business, different world — same operating system.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Each world is a real business environment Loay built a growth system inside — the
            constraint, the build, and the measured outcome, not a campaign screenshot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseStudies.map((study) => {
            const Icon = caseStudyIcons[study.slug];
            const motif = worldMotifs[study.slug];
            const live = study.status === "live";
            return (
              <Link
                key={study.slug}
                href={study.href}
                onClick={(e) => enterWorld(e, study.slug, study.href)}
                data-world-card
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface min-h-[320px] transition-colors hover:border-foreground/30"
              >
                <div className="relative h-32 border-b border-border overflow-hidden">
                  <div className={`absolute inset-0 transition-opacity duration-300 ${live ? "opacity-90 group-hover:opacity-100" : "opacity-40 group-hover:opacity-60"}`}>
                    {motif}
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
                </div>

                <div className="flex-1 flex flex-col justify-between p-8 pt-6">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted">
                        {Icon && <Icon size={14} className="shrink-0" aria-hidden="true" />}
                        {study.client}
                      </span>
                      {live ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent">
                          Live world
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full border border-border text-muted">
                          Opens in Phase 2
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight leading-snug">{study.title}</h3>
                    <p className="mt-3 text-sm text-muted leading-relaxed">{study.oneLiner}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {study.focus.map((f) => (
                      <span key={f} className="text-xs px-2.5 py-1 rounded-full border border-border text-muted">
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-muted opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-foreground">
                    Enter World
                    <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
