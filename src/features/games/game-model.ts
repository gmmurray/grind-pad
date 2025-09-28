import { SORT_DIRECTION, sortDir } from '@/lib/zod/common';

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

export const GAMES_SORT_BY = {
  TITLE: 'title',
  UPDATED: 'updated',
  CREATED: 'created',
};
export const gamesSortBy = Object.values(GAMES_SORT_BY);
export type GamesSortBy = (typeof gamesSortBy)[number];

export const DEFAULT_GAMES_SEARCH_PARAMS = {
  page: 1,
  perPage: 6,
  sortBy: GAMES_SORT_BY.TITLE,
  sortDir: SORT_DIRECTION.DESC,
};

export const SearchGamesParamsSchema = z.object({
  text: z.string().optional(),
  page: z.number().optional().default(DEFAULT_GAMES_SEARCH_PARAMS.page),
  perPage: z.number().optional().default(DEFAULT_GAMES_SEARCH_PARAMS.perPage),
  sortBy: z
    .enum(gamesSortBy)
    .optional()
    .default(DEFAULT_GAMES_SEARCH_PARAMS.sortBy),
  sortDir: sortDir.default(DEFAULT_GAMES_SEARCH_PARAMS.sortDir),
});

export type Game = z.infer<typeof GameSchema>;
export type CreateGame = z.infer<typeof CreateGameSchema>;
export type UpdateGame = z.infer<typeof UpdateGameSchema>;
export type SearchGamesParams = z.infer<typeof SearchGamesParamsSchema>;
