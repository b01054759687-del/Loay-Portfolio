// Source: /source-material/My Achievements in Plansee.pptx.pdf (PlanSee
// Business Contribution Review, Jun 2024 – present) and
// /source-material/Loay Ashraf (Performance Marketing Specialist).pdf.
// Every figure below is quoted from those documents. Where the source
// labels a figure an estimate or an internal measurement, that framing is
// preserved here rather than presented as a hard causal claim.

export const planseeMeta = {
  client: "PlanSee",
  clientDescription: "An in-house interior design company — 120+ employees, 5+ years in the market, 290 clients served.",
  role: "Marketing Specialist → Senior Marketing Specialist",
  period: "Jun 2024 – Present",
  heroStat: { value: "1,982", label: "qualified leads generated from a marketing function that didn't exist yet" },
};

export type ChapterPoint = {
  label: string;
  detail?: string;
};

export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  dek: string;
  points: ChapterPoint[];
  stats?: { value: string; label: string }[];
  note?: string;
};

export const chapters: Chapter[] = [
  {
    id: "before",
    kicker: "Chapter 1",
    title: "Before",
    dek: "Joined PlanSee while the marketing department was still in its early, unformed stage — and helped build the function rather than inheriting a mature one.",
    points: [
      { label: "No clear operating system or content structure" },
      { label: "No reliable lead flow or tracking discipline" },
      { label: "CRM existed but wasn't aligned with marketing needs" },
      { label: "No defined funnel architecture" },
      { label: "Sales alignment had to be built from scratch, not inherited" },
    ],
  },
  {
    id: "acquisition-engine",
    kicker: "Chapter 2",
    title: "Building the Acquisition Engine",
    dek: "Full-funnel media buying across Meta and TikTok, structured around a deliberate top-of-funnel / bottom-of-funnel split rather than volume alone.",
    points: [
      {
        label: "TOF — 70–80% of budget",
        detail: "Broad audience behavior and platform-based targeting.",
      },
      {
        label: "BOF — 15–20% of budget",
        detail: "Retargeting logic with structured content sequencing: testimonial, educational, destination, and branding content.",
      },
      {
        label: "Continuous audience research, A/B testing, and creative performance analysis",
      },
    ],
    stats: [
      { value: "72.4%", label: "Incremental uplift in deal volume from retargeting (BOF)" },
      { value: "58% / 42%", label: "Deal origination split — TOF vs. retargeting (BOF)" },
    ],
    note: "72.4% is an incremental uplift in deal volume, isolating retargeting's contribution — not a blended ROI figure.",
  },
  {
    id: "intelligence-layer",
    kicker: "Chapter 3",
    title: "Building the Intelligence Layer",
    dek: "Lead operations moved from manual handoffs to a fully automated CRM workflow in three stages, alongside a reporting layer that gave the business decision-grade visibility for the first time.",
    points: [
      { label: "Stage 1 — Sep 2024", detail: "Structured lead sheets and WhatsApp-ready handoffs to sales." },
      { label: "Stage 2 — Jan 2025", detail: "Direct Google Sheets ↔ CRM integration, removing manual sales-side entry." },
      { label: "Stage 3 — Jun 2025", detail: "Full automation: Meta and TikTok Lead Forms route straight into HubSpot with salesperson rotation and instant assignment." },
      { label: "Meta Conversion API (CAPI) implemented", detail: "Sends CRM qualification status back to Meta, improving the platform's optimization signal." },
      { label: "Custom reporting layer", detail: "Connects Meta, HubSpot, and Google Sheets for live, campaign-level CPQL and meeting-cost visibility." },
    ],
    stats: [
      { value: "30–46 hrs", label: "Released per month across marketing & sales from automation" },
      { value: "20–30%", label: "Associated reduction in cost per qualified lead after CAPI" },
      { value: ">EGP 1.5M", label: "Annual cost avoided vs. a comparable external BI/reporting setup" },
    ],
    note: "CPQL impact is framed as improved control and discipline from stronger signal quality, not a guaranteed fixed reduction.",
  },
  {
    id: "commercial-impact",
    kicker: "Chapter 4",
    title: "Commercial Impact",
    dek: "Apr 2025 – Feb 2026: the acquisition engine and intelligence layer converted directly into pipeline and closed business.",
    points: [
      { label: "Peak month: 448 qualified leads in Jun 2025 at EGP 447 cost per qualified lead" },
      { label: "Q4 2024 (during the build phase): 17 closed deals, 4,014 sqm, ~EGP 50.6M in estimated revenue" },
    ],
    stats: [
      { value: "EGP 2.29M", label: "Paid media spend managed" },
      { value: "1,982", label: "Qualified leads" },
      { value: "392", label: "Meetings" },
      { value: "72", label: "Deals closed" },
      { value: "13,377 sqm", label: "Business volume" },
    ],
  },
];
