import type { NextConfig } from "next";

// Repo: github.com/<owner>/Loay-Portfolio, served at <owner>.github.io/Loay-Portfolio/
// — a project page, so every internal path needs this prefix. Only applied
// when building for that deploy (GITHUB_PAGES=true) so local `next dev` is
// unaffected. NEXT_PUBLIC_BASE_PATH mirrors it for code that references
// /public assets by string path, since next/image and plain <a> tags don't
// get basePath auto-prepended the way next/link does.
const repoBasePath = "/Loay-Portfolio";
const onGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only — no server for `next start` or
  // the image optimizer, so the site must be a static export.
  output: "export",
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: onGithubPages ? repoBasePath : "" },
  ...(onGithubPages && {
    basePath: repoBasePath,
    assetPrefix: repoBasePath,
  }),
};

export default nextConfig;
