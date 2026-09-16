"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Projects() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: ".project-card", stagger: 0.15 });

  return (
    <section id="projects" className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Work</p>
        <h2 className="text-3xl sm:text-5xl font-semibold mb-16 tracking-tight">
          Selected projects
        </h2>

        <div ref={ref} className="grid sm:grid-cols-2 gap-6">
          {projects.map((project) => (
            <motion.a
              key={project.title}
              href={project.link}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="project-card group relative p-8 rounded-2xl border border-border bg-white/[0.02] hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <ArrowUpRight
                  className="text-muted group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                  size={20}
                />
              </div>
              <p className="mt-4 text-muted leading-relaxed">{project.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full border border-border text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
