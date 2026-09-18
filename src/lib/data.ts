// All facts on this page are sourced from /source-material (CV, PlanSee
// business-contribution review, Agentic AI forensic audit). Nothing here is
// invented — see each export for its source. Anything not yet supported by
// source material is marked PLACEHOLDER and must be resolved before Phase 2.

export const profile = {
  name: "Loay Ashraf",
  role: "Performance Marketing Specialist",
  tagline: "Building Growth Systems Through Media, Data & AI",
  supportingText:
    "I build measurable marketing systems that connect paid acquisition, analytics, CRM automation, and AI-powered workflows — turning media spend into qualified pipeline sales can act on.",
  location: "Cairo, Egypt", // PLACEHOLDER: exact city not stated in CV; Egypt is confirmed via employers
  email: "louyashra@gmail.com",
  phone: "+20 111 957 4917",
  linkedin: "https://www.linkedin.com/in/louy-ashraf",
  ctaPrimary: { label: "View Case Studies", href: "/#case-studies" },
  ctaSecondary: { label: "Let's Discuss Growth", href: "mailto:louyashra@gmail.com" },
  // No CV file exists yet — cvUrl stays undefined until Loay supplies one.
  // Components should fall back to a "request CV" contact link rather than
  // a dead download.
  cvUrl: undefined as string | undefined,
};

export type ImpactMetric = {
  value: string;
  label: string;
  context: string;
};

// Source: CV "Senior Marketing Specialist" bullet (Apr 2025 – Feb 2026) and
// PlanSee Business Contribution Review, Appendix 1 (verified-results.md).
export const impactMetrics: ImpactMetric[] = [
  { value: "EGP 2.29M", label: "Paid media spend managed", context: "Meta & TikTok, Apr 2025 – Feb 2026" },
  { value: "1,982", label: "Qualified leads", context: "Verified in HubSpot CRM" },
  { value: "392", label: "Meetings", context: "Campaign-attributed" },
  { value: "72", label: "Deals closed", context: "Campaign-attributed" },
  { value: "13,377 sqm", label: "Business volume", context: "Campaign-attributed" },
  { value: ">EGP 1.5M", label: "Annual cost avoidance", context: "Zero-cost Meta + HubSpot + Sheets reporting stack" },
];

export type CaseStudyStatus = "live" | "coming-soon";

export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  oneLiner: string;
  status: CaseStudyStatus;
  focus: string[];
  href: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "plansee",
    client: "PlanSee",
    title: "Building an Acquisition & Intelligence Engine From Zero",
    oneLiner:
      "How an unformed marketing function became a measurable, sales-aligned growth system — 1,982 qualified leads, 72 deals.",
    status: "live",
    focus: ["Paid media", "Funnel architecture", "CRM automation", "Attribution"],
    href: "/case-studies/plansee",
  },
  {
    slug: "markmerce",
    client: "Markmerce",
    title: "E-Commerce Growth Through Creative Testing",
    oneLiner:
      "Scaling customer acquisition for an e-commerce operation through EGC creative production and full-funnel media buying.",
    status: "coming-soon",
    focus: ["EGC creative strategy", "Creative testing", "ROAS improvement", "Revenue impact"],
    href: "/case-studies/markmerce",
  },
  {
    slug: "amlaak",
    client: "Amlaak",
    title: "Building a Marketing Function From the Ground Up",
    oneLiner:
      "Leading team execution, customer targeting, content systems, and BI reporting for a design and finishing business.",
    status: "coming-soon",
    focus: ["Team leadership", "Customer targeting", "Content system", "BI dashboards"],
    href: "/case-studies/amlaak",
  },
  {
    slug: "agentic-ai",
    client: "Personal Lab",
    title: "Agentic AI & Cloud Systems",
    oneLiner:
      "Multi-agent orchestration, MCP tooling, and cloud applications built to support marketing and business operations.",
    status: "coming-soon",
    focus: ["Multi-agent systems", "MCP", "Automation", "Cloud applications", "AI workflows"],
    href: "/case-studies/agentic-ai",
  },
  {
    slug: "harer",
    client: "Harer",
    title: "CRM Retention Strategy",
    oneLiner:
      "Diagnosing a dormant customer base and engineering a compliant reactivation strategy.",
    status: "coming-soon",
    focus: ["CRM audit", "Customer reactivation", "Regulatory compliance"],
    href: "/case-studies/harer",
  },
];
