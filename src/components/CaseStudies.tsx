import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudies } from "@/lib/data";
import { caseStudyIcons } from "@/lib/case-study-icons";

export default function CaseStudies() {
  return (
    <section id="case-studies" className="px-6 py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-muted mb-4">Case Studies</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Growth systems, not campaign screenshots.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Each case study walks through how a system was built — the constraint, the build, and the
            measured business outcome.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseStudies.map((study) => {
            const Icon = caseStudyIcons[study.slug];
            return (
            <Link
              key={study.slug}
              href={study.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-8 min-h-[260px] transition-colors hover:border-foreground/30"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted">
                    {Icon && <Icon size={14} className="shrink-0" aria-hidden="true" />}
                    {study.client}
                  </span>
                  {study.status === "coming-soon" ? (
                    <span className="text-xs px-2.5 py-1 rounded-full border border-border text-muted">
                      Coming in Phase 2
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent">
                      Live case study
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

              {study.status === "live" && (
                <ArrowUpRight
                  size={18}
                  className="absolute top-8 right-8 text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground"
                />
              )}
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
