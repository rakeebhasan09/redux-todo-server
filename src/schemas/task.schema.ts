import { z } from 'zod';

const statusValues = ['pending', 'in-progress', 'done'] as const;
const priorityValues = ['low', 'medium', 'high'] as const;
const sortValues = ['newest', 'oldest', 'priority'] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).default(''),
  status: z.enum(statusValues).default('pending'),
  priority: z.enum(priorityValues).default('medium'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(statusValues).optional(),
  priority: z.enum(priorityValues).optional(),
});

export const listTasksQuerySchema = z.object({
  query: z.string().default(''),
  status: z.enum(['all', ...statusValues]).default('all'),
  priority: z.enum(['all', ...priorityValues]).default('all'),
  sort: z.enum(sortValues).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
