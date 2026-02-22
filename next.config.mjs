/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "scholar.google.com",
      "github.com",
      "drive.google.com",
      "lh3.googleusercontent.com",
      "hirak34.netlify.app",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "**.netlify.app",
      },
    ],
  },
  // Allow deployment on any platform (Netlify, Vercel, self-hosted)
  output: process.env.NETLIFY ? undefined : undefined,
  // Trailing slash configuration (consistent across domains)
  trailingSlash: false,
  // Power headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
