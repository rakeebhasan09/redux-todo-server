import type { Request, Response } from 'express';
import { Task } from '../models/task.model';
import { serializeTask } from '../lib/serialize';
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from '../schemas/task.schema';

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export async function listTasks(req: Request, res: Response) {
  const parsed = listTasksQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { query, status, priority, sort, page, limit } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (status !== 'all') filter['status'] = status;
  if (priority !== 'all') filter['priority'] = priority;
  if (query) filter['$or'] = [
    { title: { $regex: query, $options: 'i' } },
    { description: { $regex: query, $options: 'i' } },
  ];

  if (sort === 'priority') {
    const tasks = await Task.find(filter).lean();
    tasks.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    const total = tasks.length;
    const skip = (page - 1) * limit;
    const paginated = tasks.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);
    res.json({
      data: paginated.map(serializeTask as never),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
    return;
  }

  const sortOrder = sort === 'oldest' ? { createdAt: 1 as const } : { createdAt: -1 as const };
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortOrder).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  res.json({
    data: tasks.map(serializeTask as never),
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
}

export async function getTaskStats(_req: Request, res: Response) {
  const [byStatusRaw, byPriorityRaw, total] = await Promise.all([
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Task.countDocuments(),
  ]);

  const byStatus: Record<string, number> = { pending: 0, 'in-progress': 0, done: 0 };
  for (const row of byStatusRaw) byStatus[row._id] = row.count;

  const byPriority: Record<string, number> = { low: 0, medium: 0, high: 0 };
  for (const row of byPriorityRaw) byPriority[row._id] = row.count;

  res.json({ total, byStatus, byPriority });
}

export async function getTaskById(req: Request, res: Response) {
  const task = await Task.findById(req.params['id']).lean();
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(serializeTask(task as never));
}

export async function createTask(req: Request, res: Response) {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const task = await Task.create(parsed.data);
  res.status(201).json(serializeTask(task));
}

export async function updateTask(req: Request, res: Response) {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const task = await Task.findByIdAndUpdate(req.params['id'], parsed.data, { new: true }).lean();
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(serializeTask(task as never));
}

export async function deleteTask(req: Request, res: Response) {
  const task = await Task.findByIdAndDelete(req.params['id']);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(204).send();
}
