import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force rebuild - v2.0.1
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com'
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com'
      }
    ]
  }
};

export default nextConfig;
