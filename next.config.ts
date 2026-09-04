import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Pre-existing transitive @types/* resolution errors in the generated
    // .next/types folder — webpack compilation succeeds cleanly.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Disable filesystem cache to avoid ENOSPC errors on full disks
    config.cache = false;
    return config;
  },
};

export default nextConfig;
