import type { NextConfig } from "next";
import { redirects } from "./src/content/redirects";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  redirects() {
    return redirects;
  },
};

export default nextConfig;
