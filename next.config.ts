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
    // Disable image optimization caching in development
    unoptimized: process.env.NODE_ENV === "development",
    // Add cache control headers
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add experimental features for better caching
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
};

export default nextConfig;
