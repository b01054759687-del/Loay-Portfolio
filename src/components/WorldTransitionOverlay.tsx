"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { worldMotifs } from "@/lib/world-motifs";

// A lightweight "entering a world" feeling without shared-element route
// morphing: a full-screen wash in that world's own accent, showing its own
// motif (reused from the Growth Worlds grid, not new art), that wipes away
// once the destination route has actually mounted. Mounted once in the root
// layout so it survives navigation. Cards dispatch "growth-world-enter" with
// { slug } and then push the route themselves after a short delay.
const WARM_WORLDS = new Set(["plansee"]);

export type WorldEnterDetail = { slug: string };

export default function WorldTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const activeRef = useRef(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    function onEnter(e: Event) {
      const detail = (e as CustomEvent<WorldEnterDetail>).detail;
      if (!detail?.slug || !overlay) return;

      activeRef.current = true;
      setSlug(detail.slug);
      overlay.style.setProperty("--wash-color", WARM_WORLDS.has(detail.slug) ? "var(--accent-warm)" : "var(--accent)");

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(overlay, { opacity: 1, pointerEvents: "auto", clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      gsap.set(overlay, { pointerEvents: "auto" });
      gsap.fromTo(
        overlay,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power3.inOut" }
      );
    }

    window.addEventListener("growth-world-enter", onEnter);
    return () => window.removeEventListener("growth-world-enter", onEnter);
  }, []);

  // Once the destination route has actually mounted (pathname changed),
  // wipe the overlay away.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !activeRef.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current = false;

    if (reduced) {
      gsap.set(overlay, { opacity: 0, pointerEvents: "none" });
      return;
    }

    const tween = gsap.fromTo(
      overlay,
      { clipPath: "inset(0% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.5,
        delay: 0.12,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(overlay, { pointerEvents: "none", clipPath: "inset(100% 0% 0% 0%)" });
        },
      }
    );
    return () => {
      tween.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      id="world-transition-overlay"
      aria-hidden="true"
      className="fixed inset-0 z-[60] pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--wash-color, var(--accent)) 30%, var(--background)), var(--background) 75%)",
        clipPath: "inset(100% 0% 0% 0%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-40 [&_svg]:w-[280px] [&_svg]:h-[280px] sm:[&_svg]:w-[380px] sm:[&_svg]:h-[380px]">
        {slug ? worldMotifs[slug] : null}
      </div>
    </div>
  );
}
