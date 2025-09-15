import z from 'zod';

export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
} as const;
export const sortDirections = Object.values(SORT_DIRECTION);
export const sortDir = z.enum(sortDirections);
export type SortDir = z.infer<typeof sortDir>;
