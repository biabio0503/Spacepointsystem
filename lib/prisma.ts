import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaAdapter: PrismaPg | undefined;
};

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL 또는 DIRECT_URL 환경변수가 필요합니다.');
}

const prismaPool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString,
  });

const prismaAdapter =
  globalForPrisma.prismaAdapter ??
  new PrismaPg(prismaPool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: prismaAdapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaPool = prismaPool;
  globalForPrisma.prismaAdapter = prismaAdapter;
  globalForPrisma.prisma = prisma;
}

export default prisma;
