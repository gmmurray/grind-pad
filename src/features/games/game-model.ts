import { TimestampSchema } from '@/lib/pocketbase';
import z from 'zod';

export const GameSchema = z
  .object({
    id: z.string(),
    user: z.string(),
    title: z.string().min(1, 'Title is required'),
  })
  .extend(TimestampSchema.shape);

export const CreateGameSchema = z.object({
  title: GameSchema.shape.title,
});

export const UpdateGameSchema = z.object({
  title: GameSchema.shape.title,
});

export type Game = z.infer<typeof GameSchema>;
export type CreateGame = z.infer<typeof CreateGameSchema>;
export type UpdateGame = z.infer<typeof UpdateGameSchema>;
