import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CaseStudy } from "@/lib/data";
import { profile } from "@/lib/data";
import { caseStudyIcons } from "@/lib/case-study-icons";

// Architecture placeholder for a Phase 2 case study. The route, layout, and
// data contract already exist — only the chapter-by-chapter narrative
// (built the same way as /case-studies/plansee) is pending source material
// review and approval.
export default function CaseStudyPlaceholder({ study }: { study: CaseStudy }) {
  const Icon = caseStudyIcons[study.slug];
  return (
    <section className="relative px-6 pt-28 pb-24 sm:pt-36 sm:pb-32 min-h-screen">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/#case-studies"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          All case studies
        </Link>

        <span className="inline-flex text-xs px-2.5 py-1 rounded-full border border-border text-muted mb-6">
          Coming in Phase 2
        </span>

        <p className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted mb-4">
          {Icon && <Icon size={16} className="shrink-0" aria-hidden="true" />}
          {study.client}
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">{study.title}</h1>
        <p className="mt-6 text-lg text-muted leading-relaxed">{study.oneLiner}</p>

        <div className="mt-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted mb-4">Planned focus</p>
          <div className="flex flex-wrap gap-2">
            {study.focus.map((f) => (
              <span key={f} className="text-sm px-3 py-1.5 rounded-full border border-border text-muted">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-14 text-sm text-muted leading-relaxed max-w-xl">
          This case study will follow the same evidence-only standard as the PlanSee case study —
          published once the underlying metrics and assets are reviewed. In the meantime,{" "}
          <a href={profile.ctaSecondary.href} className="text-foreground underline underline-offset-4">
            get in touch
          </a>{" "}
          directly.
        </p>
      </div>
    </section>
  );
}
