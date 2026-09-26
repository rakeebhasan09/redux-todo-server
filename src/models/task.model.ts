import { Schema, model, type Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true },
);

export const Task = model<ITask>('Task', taskSchema);
