import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'ai-ethics-scenario-game';
const basePath = isGitHubPages && !repositoryName.endsWith('.github.io') ? `/${repositoryName}` : '';
const pagesOutput = process.env.GITHUB_PAGES_DIST ?? '.next-pages';

const nextConfig: NextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  distDir: isGitHubPages ? pagesOutput : undefined,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
};

export default nextConfig;
