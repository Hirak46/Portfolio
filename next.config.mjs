/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['scholar.google.com', 'github.com', 'drive.google.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
};

export default nextConfig;
