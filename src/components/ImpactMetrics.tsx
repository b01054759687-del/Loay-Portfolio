"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { impactMetrics } from "@/lib/data";

// Parses "EGP 2.29M", "1,982", "13,377 sqm", ">EGP 1.5M" into a numeric
// target plus the surrounding prefix/suffix, so the number can count up
// while the unit text stays put.
function parseMetric(value: string) {
  const match = value.match(/-?[\d,]+\.?\d*/);
  if (!match) return { prefix: value, numeric: null as number | null, suffix: "", decimals: 0 };
  const numeric = parseFloat(match[0].replace(/,/g, ""));
  const decimals = match[0].includes(".") ? match[0].split(".")[1].length : 0;
  const index = match.index ?? 0;
  return {
    prefix: value.slice(0, index),
    numeric,
    suffix: value.slice(index + match[0].length),
    decimals,
    hasComma: match[0].includes(","),
  };
}

export default function ImpactMetrics() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
        const cards = section.querySelectorAll<HTMLElement>("[data-metric-card]");

        if (reduced) {
          // Skip motion entirely: show final values immediately.
          gsap.set(cards, { opacity: 1, y: 0 });
          cards.forEach((card) => {
            const numberEl = card.querySelector<HTMLElement>("[data-metric-number]");
            if (numberEl) numberEl.textContent = numberEl.dataset.value ?? numberEl.textContent;
          });
          return;
        }

        gsap.fromTo(
          cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: section, start: "top 75%" },
          }
        );

        cards.forEach((card) => {
          const numberEl = card.querySelector<HTMLElement>("[data-metric-number]");
          if (!numberEl) return;
          const raw = numberEl.dataset.value ?? "";
          const { prefix, numeric, suffix, decimals, hasComma } = parseMetric(raw);
          if (numeric === null) return;

          const counter = { value: 0 };
          gsap.to(counter, {
            value: numeric,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 80%" },
            onUpdate: () => {
              const formatted = decimals
                ? counter.value.toFixed(decimals)
                : Math.round(counter.value).toLocaleString("en-US");
              const display = hasComma && !decimals ? formatted : decimals ? counter.value.toFixed(decimals) : formatted;
              numberEl.textContent = `${prefix}${display}${suffix}`;
            },
          });
        });

        ScrollTrigger.refresh();
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section id="impact" className="px-6 py-24 sm:py-32 border-t border-border" ref={sectionRef}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-muted mb-4">Verified Business Impact</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Marketing measured in business outcomes, not vanity metrics.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            PlanSee, Apr 2025 – Feb 2026 — every figure below is sourced from verified CRM and campaign records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {impactMetrics.map((metric) => (
            <div
              key={metric.label}
              data-metric-card
              className="bg-background p-8 flex flex-col gap-2"
            >
              <span
                data-metric-number
                data-value={metric.value}
                className="text-metric text-3xl sm:text-4xl font-semibold tracking-tight"
              >
                {metric.value}
              </span>
              <span className="font-medium">{metric.label}</span>
              <span className="text-sm text-muted">{metric.context}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
