import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer", "@cf-wasm/photon"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Cloudflare Workers: /_next/image is unavailable; serve /api/media URLs directly.
    unoptimized:
      process.env.NODE_ENV === "development" ||
      process.env.SANDOOK_RUNTIME === "cloudflare",
  },
  async redirects() {
    return [
      { source: "/work", destination: "/gallery", permanent: true },
      { source: "/work/:slug", destination: "/gallery/:slug", permanent: true },
      { source: "/diy", destination: "/gallery", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
