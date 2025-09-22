import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * Ensures single instance across the application
 */
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;