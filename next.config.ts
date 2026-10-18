import type { NextConfig } from "next";
import { redirects } from "./src/content/redirects";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Media library uploads are served from the Supabase Storage public bucket.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
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
