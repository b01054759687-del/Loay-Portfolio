import type { Metadata } from "next";
import PlanSeeStory from "@/components/case-studies/PlanSeeStory";
import { planseeMeta } from "@/lib/plansee";

export const metadata: Metadata = {
  title: `${planseeMeta.client} — Building an Acquisition & Intelligence Engine From Zero`,
  description:
    "How an unformed marketing function at PlanSee became a measurable, sales-aligned growth system: 1,982 qualified leads and 72 deals from EGP 2.29M in managed media spend.",
};

export default function PlanSeeCaseStudyPage() {
  return <PlanSeeStory />;
}
