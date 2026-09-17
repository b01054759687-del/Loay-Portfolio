import type { Metadata } from "next";
import CaseStudyPlaceholder from "@/components/case-studies/CaseStudyPlaceholder";
import { caseStudies } from "@/lib/data";

const study = caseStudies.find((s) => s.slug === "agentic-ai")!;

export const metadata: Metadata = {
  title: `${study.client} — ${study.title}`,
  description: study.oneLiner,
};

export default function AgenticAiCaseStudyPage() {
  return <CaseStudyPlaceholder study={study} />;
}
