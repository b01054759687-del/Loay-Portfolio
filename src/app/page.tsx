import Hero from "@/components/Hero";
import CommandCenterDiagram from "@/components/CommandCenterDiagram";
import ImpactMetrics from "@/components/ImpactMetrics";
import CaseStudies from "@/components/CaseStudies";

export default function Home() {
  return (
    <>
      <Hero />
      <CommandCenterDiagram />
      <ImpactMetrics />
      <CaseStudies />
    </>
  );
}
