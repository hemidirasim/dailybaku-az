import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization - only create client when actually used
function getPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  
  // During build phase, allow build to continue without DATABASE_URL
  // The actual error will occur at runtime when Prisma is used
  if (!databaseUrl) {
    // Check if we're in build phase
    if (process.env.NEXT_PHASE === 'phase-production-build' || 
        process.env.NEXT_PHASE === 'phase-development-build' ||
        !process.env.NEXT_RUNTIME) {
      // Return a proxy that will throw error when methods are called
      return new Proxy({} as PrismaClient, {
        get() {
          throw new Error('DATABASE_URL environment variable is not set. Please configure it in your environment variables.');
        }
      });
    }
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 10 seconds for Vercel
    statement_timeout: 30000, // 30 seconds for queries
    query_timeout: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Use getter to defer initialization
export const prisma: PrismaClient = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  const client = getPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
})();

