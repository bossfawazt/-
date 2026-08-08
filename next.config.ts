import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // placehold.co: dev-only stand-in for product photos until AI Image
    // Studio / UploadThing uploads are live (docs/AI-SYSTEM-touq.md #3.2).
    // *.ufs.sh / *.utfs.io: UploadThing's serving domains for real uploads.
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "*.utfs.io" },
    ],
  },
};

export default nextConfig;
