"use client";

import dynamic from "next/dynamic";

// three.js is WebGL-only and heavy: keep it out of the server render and the
// initial bundle. Without WebGL the page still works — every anchor carries a
// CSS fallback that is hidden once the canvas reports it is running.
const Scene = dynamic(() => import("@/components/universe/Scene"), { ssr: false });

export default function UniverseStage() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <Scene />
      </div>
      <div aria-hidden="true" className="universe-vignette pointer-events-none fixed inset-0 -z-[5]" />
      <div aria-hidden="true" className="universe-grain pointer-events-none fixed inset-0 -z-[4]" />
    </>
  );
}
