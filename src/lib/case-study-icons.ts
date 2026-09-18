import { Compass, ShoppingBag, Building2, Workflow, RefreshCw, type LucideIcon } from "lucide-react";

// One glyph per world so the homepage grid signals industry before a click —
// live and "coming soon" cards alike. Not literal logos: a plain, line-based
// signifier of the business the case study is set in.
export const caseStudyIcons: Record<string, LucideIcon> = {
  plansee: Compass, // architecture / interior design
  markmerce: ShoppingBag, // e-commerce
  amlaak: Building2, // interior finishing / operations
  "agentic-ai": Workflow, // agent systems, deliberately not a literal "robot" icon
  harer: RefreshCw, // CRM retention / reactivation
};
