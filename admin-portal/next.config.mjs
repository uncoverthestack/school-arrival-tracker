/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' is for the Dockerfile's self-hosted build — Vercel's own build
  // pipeline expects the default output shape and breaks (ENOENT on a .nft.json
  // trace file) if this is set during a Vercel build, so skip it there.
  output: process.env.VERCEL ? undefined : 'standalone',
};

export default nextConfig;
