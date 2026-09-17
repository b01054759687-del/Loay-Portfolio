import type { NextConfig } from "next";

// Repo: github.com/<owner>/Loay-Portfolio, served at <owner>.github.io/Loay-Portfolio/
// — a project page, so every internal path needs this prefix. Only applied in
// the GitHub Actions build (GITHUB_PAGES=true) so local `next dev` is unaffected.
const repoBasePath = "/Loay-Portfolio";
const onGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only — no server for `next start` or
  // the image optimizer, so the site must be a static export.
  output: "export",
  images: { unoptimized: true },
  ...(onGithubPages && {
    basePath: repoBasePath,
    assetPrefix: repoBasePath,
  }),
};

export default nextConfig;
