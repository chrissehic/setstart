// lib/prisma.ts

import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling and timeout settings
    __internal: {
      engine: {
        // Increase connection pool size
        connectionLimit: 10,
        // Add connection timeout
        connectionTimeout: 30000, // 30 seconds
        // Add query timeout
        queryTimeout: 60000, // 60 seconds
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;