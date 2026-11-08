import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* cacheComponents disabled to allow dynamic DB-backed Route Handlers */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
