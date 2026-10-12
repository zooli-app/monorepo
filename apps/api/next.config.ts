import type { NextConfig } from "next";

const config: NextConfig = {
  // Pure API service — no client-rendered pages to optimize.
  reactStrictMode: true,
  transpilePackages: ["@zooli/vendor-forms"],
};
export default config;
