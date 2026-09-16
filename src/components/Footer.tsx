import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        <p>Built with Next.js, Framer Motion & GSAP.</p>
      </div>
    </footer>
  );
}
