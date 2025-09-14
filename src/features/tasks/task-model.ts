import { TimestampSchema } from '@/lib/pocketbase';
import z from 'zod';

export const TASK_STATUSES = {
  OPEN: 'open',
  DONE: 'done',
} as const;

export const taskStatuses = Object.values(TASK_STATUSES);

export const TASK_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  OTHER: 'other',
} as const;

export const taskTypes = Object.values(TASK_TYPES);
export type TaskType = (typeof taskTypes)[number];

export const TaskSchema = z
  .object({
    id: z.string(),
    user: z.string(),
    game: z.string(),
    text: z.string().min(1, 'Text is required'),
    status: z.enum(taskStatuses).default('open'),
    position: z.number(),
    type: z.enum(taskTypes).default('daily'),
  })
  .extend(TimestampSchema.shape);

export const CreateTaskSchema = z.object({
  text: TaskSchema.shape.text,
  position: TaskSchema.shape.position,
  type: z.enum(taskTypes),
});

export const UpdateTaskSchema = z.object({
  text: TaskSchema.shape.text.optional(),
  status: z.enum(taskStatuses).optional(),
  position: TaskSchema.shape.position.optional(),
});

export const RebalanceTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: TaskSchema.shape.id,
      position: TaskSchema.shape.position,
    }),
  ),
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type RebalanceTasks = z.infer<typeof RebalanceTasksSchema>;
