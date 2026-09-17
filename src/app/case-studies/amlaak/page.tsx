import type { Metadata } from "next";
import CaseStudyPlaceholder from "@/components/case-studies/CaseStudyPlaceholder";
import { caseStudies } from "@/lib/data";

const study = caseStudies.find((s) => s.slug === "amlaak")!;

export const metadata: Metadata = {
  title: `${study.client} — ${study.title}`,
  description: study.oneLiner,
};

export default function AmlaakCaseStudyPage() {
  return <CaseStudyPlaceholder study={study} />;
}
