/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' is for the Dockerfile's self-hosted build — Vercel's own build
  // pipeline expects the default output shape and breaks (ENOENT on a .nft.json
  // trace file) if this is set during a Vercel build, so skip it there.
  output: process.env.VERCEL ? undefined : 'standalone',

  // Next.js advertises itself with "X-Powered-By: Next.js" on every response.
  // It serves no purpose for clients and tells a scanner which framework (and so
  // which CVE list) to try. Applies to both the Vercel deployment and the
  // self-hosted standalone build.
  poweredByHeader: false,
};

export default nextConfig;
