import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // instrumentation.ts is auto-loaded in Next.js 15+ — no flag needed
  // Turbopack is default in Next.js 16 — no webpack config needed
  turbopack: {},
  transpilePackages: ["@zooli/vendor-forms"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.zooli.in",
      },
    ],
  },
};

export default nextConfig;
