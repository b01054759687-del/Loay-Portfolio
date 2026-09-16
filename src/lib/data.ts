export const profile = {
  name: "Your Name",
  role: "Product Designer & Frontend Developer",
  tagline: "I design and build interfaces that feel alive.",
  location: "Cairo, Egypt",
  email: "you@example.com",
  socials: [
    { label: "GitHub", url: "https://github.com/yourname" },
    { label: "LinkedIn", url: "https://linkedin.com/in/yourname" },
    { label: "Dribbble", url: "https://dribbble.com/yourname" },
  ],
};

export const about = {
  paragraphs: [
    "I'm a designer-developer hybrid who spends equal time in Figma and in code. I care about the small details — the easing curve on a hover state, the way a section reveals itself as you scroll.",
    "Over the past few years I've worked on SaaS dashboards, marketing sites, and interactive product experiences, always pushing for interfaces that feel considered rather than default.",
  ],
  stats: [
    { label: "Years experience", value: "4+" },
    { label: "Projects shipped", value: "30+" },
    { label: "Happy clients", value: "20+" },
  ],
};

export const skills = [
  "Figma",
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "GSAP",
  "Framer Motion",
  "Three.js",
  "Node.js",
  "UI/UX Design",
];

export type Project = {
  title: string;
  description: string;
  tags: string[];
  link: string;
};

export const projects: Project[] = [
  {
    title: "Nova Dashboard",
    description:
      "An analytics dashboard with real-time charts, dark mode, and micro-interactions across every state.",
    tags: ["Next.js", "Tailwind", "Framer Motion"],
    link: "#",
  },
  {
    title: "Aurora Landing",
    description:
      "A marketing site with scroll-driven storytelling and a GSAP-powered hero animation.",
    tags: ["GSAP", "ScrollTrigger", "TypeScript"],
    link: "#",
  },
  {
    title: "Pulse Mobile App",
    description:
      "A fitness tracking app UI with fluid gesture-based transitions and shared element animations.",
    tags: ["React Native", "UI/UX", "Reanimated"],
    link: "#",
  },
  {
    title: "Orbit Design System",
    description:
      "A component library and documentation site used across five internal products.",
    tags: ["Design System", "Storybook", "Figma"],
    link: "#",
  },
];
