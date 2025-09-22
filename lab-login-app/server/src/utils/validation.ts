import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

export const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  department: z.string().min(1, 'Department is required').max(50, 'Department too long'),
  year: z.string().min(1, 'Year is required').max(20, 'Year too long')
});

export const scanSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  type: z.enum(['in', 'out']).optional().default('in')
});

export const dateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type ScanInput = z.infer<typeof scanSchema>;
export type DateInput = z.infer<typeof dateSchema>;