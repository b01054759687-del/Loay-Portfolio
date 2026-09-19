import UniverseStage from "@/components/UniverseStage";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import OperatingLoop from "@/components/OperatingLoop";
import CaseStudies from "@/components/CaseStudies";
import Closing from "@/components/Closing";

// One story, told in five acts over a single WebGL universe:
// signal (hero) -> premise (manifesto) -> the loop -> the worlds -> handoff.
// No metrics on this page: the numbers live inside each world.
export default function Home() {
  return (
    <>
      <UniverseStage />
      <Hero />
      <Manifesto />
      <OperatingLoop />
      <CaseStudies />
      <Closing />
    </>
  );
}
