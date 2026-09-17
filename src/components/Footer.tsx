import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href={profile.linkedin} className="hover:text-foreground transition-colors" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`} className="hover:text-foreground transition-colors">
            {profile.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
