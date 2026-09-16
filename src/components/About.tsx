"use client";

import { about } from "@/lib/data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function About() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: ".reveal", stagger: 0.15 });

  return (
    <section id="about" className="py-32 px-6">
      <div ref={ref} className="mx-auto max-w-4xl">
        <p className="reveal text-sm uppercase tracking-[0.3em] text-accent mb-4">
          About
        </p>
        <div className="reveal space-y-6 text-lg sm:text-xl text-muted leading-relaxed">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="reveal mt-16 grid grid-cols-3 gap-6 border-t border-border pt-10">
          {about.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl sm:text-4xl font-semibold text-gradient">
                {stat.value}
              </p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
