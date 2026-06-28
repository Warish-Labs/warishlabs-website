import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Next.js 16 Cache Components / PPR configuration
  // cacheComponents: true,
};

export default nextConfig;
