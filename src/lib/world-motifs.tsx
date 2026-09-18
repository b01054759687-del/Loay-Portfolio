// Abstract, non-confidential visual language per Growth World. No real
// PlanSee (or any client) imagery, renders, or logos — these are original
// line-art motifs that establish mood, not documentation.
import type { ReactNode } from "react";

const common = { fill: "none" as const, strokeWidth: 1.4 };

function PlanSeeMotif() {
  // Luxury interior design + growth system: an architectural floor grid.
  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" aria-hidden="true">
      <rect data-reveal-line x="20" y="20" width="260" height="120" stroke="var(--accent-warm)" {...common} />
      <line data-reveal-line x1="140" y1="20" x2="140" y2="140" stroke="var(--accent-warm)" strokeWidth="1" opacity="0.55" />
      <line data-reveal-line x1="20" y1="80" x2="280" y2="80" stroke="var(--accent-warm)" strokeWidth="1" opacity="0.55" />
      <circle cx="200" cy="50" r="14" fill="none" stroke="var(--accent-warm)" strokeWidth="1" opacity="0.6" />
      <line x1="200" y1="36" x2="200" y2="64" stroke="var(--accent-warm)" strokeWidth="1" opacity="0.6" />
      <line x1="186" y1="50" x2="214" y2="50" stroke="var(--accent-warm)" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function MarkmerceMotif() {
  // E-commerce creative studio: product frames + a conversion pathway.
  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" aria-hidden="true">
      {[{ x: 30, y: 24 }, { x: 116, y: 40 }, { x: 202, y: 24 }].map((f, i) => (
        <g key={i}>
          <rect data-reveal-line x={f.x} y={f.y} width="68" height="88" stroke="var(--accent)" {...common} />
          <line x1={f.x} y1={f.y} x2={f.x + 14} y2={f.y} stroke="var(--accent)" strokeWidth="2" />
          <line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 14} stroke="var(--accent)" strokeWidth="2" />
          <line x1={f.x + 68} y1={f.y + 88} x2={f.x + 54} y2={f.y + 88} stroke="var(--accent)" strokeWidth="2" />
          <line x1={f.x + 68} y1={f.y + 88} x2={f.x + 68} y2={f.y + 74} stroke="var(--accent)" strokeWidth="2" />
        </g>
      ))}
      <path data-reveal-line d="M20,140 L280,140" stroke="var(--accent)" strokeWidth="1" opacity="0.4" strokeDasharray="4 5" />
    </svg>
  );
}

function AmlaakMotif() {
  // Marketing operations room: a wall of workflow tiles.
  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" aria-hidden="true">
      {Array.from({ length: 3 }).flatMap((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            data-reveal-fill
            x={24 + col * 66}
            y={20 + row * 44}
            width="52"
            height="30"
            fill="var(--accent)"
            opacity={0.06 + ((row + col) % 3) * 0.05}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))
      )}
      <path data-reveal-line d="M50,35 L182,35 L182,107 L248,107" fill="none" stroke="var(--accent-warm)" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

function AIMotif() {
  // AI growth infrastructure: agent nodes and automation edges.
  const nodes = [
    { x: 50, y: 80 },
    { x: 120, y: 36 },
    { x: 120, y: 124 },
    { x: 200, y: 80 },
    { x: 266, y: 44 },
    { x: 266, y: 116 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
  ];
  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          data-reveal-line
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="var(--accent)"
          strokeWidth="1.2"
          opacity="0.6"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i === 3 ? 7 : 5} fill="none" stroke="var(--accent)" strokeWidth="1.4" />
      ))}
    </svg>
  );
}

function HarerMotif() {
  // CRM retention: a reactivation loop, dormant fading into active.
  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" aria-hidden="true">
      <path
        data-reveal-line
        d="M150,30 A50,50 0 1,1 100,80"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.6"
      />
      <polygon points="92,68 100,80 112,74" fill="var(--accent)" opacity="0.8" />
      <circle cx="150" cy="30" r="5" fill="none" stroke="var(--border)" strokeWidth="1.4" />
      <circle cx="150" cy="130" r="5" fill="var(--accent-warm)" opacity="0.8" />
    </svg>
  );
}

export const worldMotifs: Record<string, ReactNode> = {
  plansee: <PlanSeeMotif />,
  markmerce: <MarkmerceMotif />,
  amlaak: <AmlaakMotif />,
  "agentic-ai": <AIMotif />,
  harer: <HarerMotif />,
};
