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
  },
  // Add environment variables to disable verbose logging
  env: {
    PRISMA_QUERY_LOG: 'false',
    DEBUG: '',
  },
  // Add network timeout and compression settings
  experimental: {
    // Optimize package imports for better performance
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
    // Add server action timeout configurations
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
      bodySizeLimit: '2mb',
    },
  },
  // Add compression and timeout headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Request-Timeout',
            value: '30000',
          },
          {
            key: 'Keep-Alive',
            value: 'timeout=30, max=1000',
          },
        ],
      },
    ];
  },
  // Configure webpack for better network handling and cache optimization
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    }
    
    // Optimize webpack cache to address the big strings warning
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        compression: 'gzip',
        maxMemoryGenerations: 1,
        store: 'pack',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
  // Move serverExternalPackages to the correct location
  serverExternalPackages: ['@prisma/client'],
  // Add server timeout configurations
  serverRuntimeConfig: {
    // Will only be available on the server side
    serverActionTimeout: 30000,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    clientTimeout: 30000,
  },
};

export default nextConfig;
