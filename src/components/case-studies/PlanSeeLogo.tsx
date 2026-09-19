import { planseeMeta } from "@/lib/plansee";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// PlanSee's own logo (gold, stacked "plan / see"), used as the world's
// signature. Until the official logo file is supplied and set as
// planseeMeta.logoSrc, a plain text wordmark stands in — nothing is redrawn or
// imitated.
export default function PlanSeeLogo({ height = 48 }: { height?: number }) {
  if (planseeMeta.logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`${BASE_PATH}${planseeMeta.logoSrc}`} alt="PlanSee" style={{ height }} className="w-auto" />
    );
  }
  return (
    <span className="font-display text-3xl font-semibold tracking-tight text-accent-warm" aria-label="PlanSee">
      PlanSee
    </span>
  );
}
