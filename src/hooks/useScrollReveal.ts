"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function useScrollReveal<T extends HTMLElement>(
  options: { y?: number; stagger?: number; selector?: string } = {}
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = options.selector
      ? container.querySelectorAll(options.selector)
      : [container];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: options.y ?? 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: options.stagger ?? 0.12,
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [options.y, options.stagger, options.selector]);

  return containerRef;
}

export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}
