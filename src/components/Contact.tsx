"use client";

import { motion } from "framer-motion";
import { profile } from "@/lib/data";

export default function Contact() {
  return (
    <section id="contact" className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Contact</p>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          Let&apos;s build something{" "}
          <span className="text-gradient">worth remembering.</span>
        </h2>
        <p className="mt-6 text-muted text-lg">
          {profile.location} · Available for freelance and full-time roles
        </p>

        <a
          href={`mailto:${profile.email}`}
          className="mt-10 inline-flex px-8 py-4 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
        >
          {profile.email}
        </a>

        <div className="mt-10 flex justify-center gap-6 text-muted">
          {profile.socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
