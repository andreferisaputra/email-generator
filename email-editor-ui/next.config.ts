import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["email-editor-core"],
  turbopack: {
    root: "../",
  },
};

export default nextConfig;
