import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // A stray lockfile in the home directory makes Next mis-detect the workspace root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
