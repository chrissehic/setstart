import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sdmntprukwest.oaiusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sdmntpreastus.oaiusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
