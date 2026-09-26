import type { ITask } from '../models/task.model';

export interface ApiTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
}

export function serializeTask(task: ITask): ApiTask {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    createdAt: task.createdAt.getTime(),
    updatedAt: task.updatedAt.getTime(),
  };
}
