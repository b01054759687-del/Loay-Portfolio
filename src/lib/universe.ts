"use client";

import { useCallback } from "react";

// Shared, non-reactive bridge between the DOM story (Framer Motion sections)
// and the WebGL universe. The canvas never owns layout: every 3D object is
// pinned to a real DOM "anchor" element, read each frame, so scrolling,
// resizing and hovering stay perfectly in sync with the text and links.

export type WorldVisual = {
  kind: number; // selects the planet's fragment-shader "visual language"
  color: [number, number, number];
  live: boolean;
};

const BLUE: [number, number, number] = [0.31, 0.42, 1.0];
const GOLD: [number, number, number] = [0.84, 0.64, 0.31];

export const worldVisuals: Record<string, WorldVisual> = {
  plansee: { kind: 0, color: GOLD, live: true },
  markmerce: { kind: 1, color: BLUE, live: false },
  amlaak: { kind: 2, color: BLUE, live: false },
  "agentic-ai": { kind: 3, color: [0.45, 0.62, 1.0], live: false },
  harer: { kind: 4, color: BLUE, live: false },
};

export const universe = {
  pointerPx: { x: 0, y: 0 },
  hovered: null as string | null,
  loopProgress: 0,
  loopStep: 0,
  warpTarget: 0,
};

const anchors = new Map<string, HTMLElement>();

export function getAnchors() {
  return anchors;
}

export function useAnchor(id: string) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) anchors.set(id, el);
      else anchors.delete(id);
    },
    [id]
  );
}
