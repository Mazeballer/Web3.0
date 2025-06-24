// next.config.mjs
import nextPwa from 'next-pwa';

// 1) Define only your PWA/Workbox options here:
const withPWA = nextPwa({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};

// 2) Wrap your *Next.js* config, not the other way around:
export default withPWA(nextConfig);
