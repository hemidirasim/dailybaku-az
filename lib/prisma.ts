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
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
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

