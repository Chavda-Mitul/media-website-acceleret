import type { NextConfig } from "next";

// Everything under these folders is named by a hash of its contents (see lib/media.ts), so a changed file always
// gets a new name and browsers can keep them for a year. Optimised /_next/image copies inherit the lifetime.
const IMMUTABLE_ASSETS = ["/assets/images/:path*", "/assets/videos/:path*"];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // AVIF is about 20% smaller than WebP; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return IMMUTABLE_ASSETS.map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }));
  },
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
