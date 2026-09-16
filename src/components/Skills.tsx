import { skills } from "@/lib/data";

export default function Skills() {
  const loop = [...skills, ...skills];

  return (
    <section id="skills" className="py-24 border-y border-border overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee w-max">
        {loop.map((skill, i) => (
          <span
            key={i}
            className="text-3xl sm:text-5xl font-semibold text-muted/40 mx-8 flex items-center gap-8"
          >
            {skill}
            <span className="text-accent/60">/</span>
          </span>
        ))}
      </div>
    </section>
  );
}
