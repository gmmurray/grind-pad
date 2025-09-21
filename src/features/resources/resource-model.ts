import { SORT_DIRECTION, sortDir } from '@/lib/zod/common';

import { TimestampSchema } from '@/lib/pocketbase';
import z from 'zod';

export const ResourceSchema = z
  .object({
    id: z.string(),
    user: z.string(),
    game: z.string(),
    title: z.string().min(1, 'Title is required'),
    url: z.url().min(1, 'URL is required'),
    description: z.string(),
    tags: z.array(z.string()),
  })
  .extend(TimestampSchema.shape);

export const CreateResourceSchema = z.object({
  title: ResourceSchema.shape.title,
  url: ResourceSchema.shape.url,
  description: ResourceSchema.shape.description,
  tags: ResourceSchema.shape.tags,
});

export const UpdateResourceSchema = z.object({
  title: ResourceSchema.shape.title,
  url: ResourceSchema.shape.url,
  description: ResourceSchema.shape.description,
  tags: ResourceSchema.shape.tags,
});

export const RESOURCES_SORT_BY = {
  TITLE: 'title',
  CREATED: 'created',
};
export const resourcesSortBy = Object.values(RESOURCES_SORT_BY);
export type ResourcesSortBy = (typeof resourcesSortBy)[number];

export const DEFAULT_RESOURCE_SEARCH_PARAMS = {
  page: 1,
  perPage: 6,
  sortBy: RESOURCES_SORT_BY.CREATED,
  sortDir: SORT_DIRECTION.DESC,
};
export const SearchResourcesParamsSchema = z.object({
  gameId: z.string(),
  text: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().optional().default(DEFAULT_RESOURCE_SEARCH_PARAMS.page),
  perPage: z
    .number()
    .optional()
    .default(DEFAULT_RESOURCE_SEARCH_PARAMS.perPage),
  sortBy: z
    .enum(resourcesSortBy)
    .optional()
    .default(DEFAULT_RESOURCE_SEARCH_PARAMS.sortBy),
  sortDir: sortDir.default(DEFAULT_RESOURCE_SEARCH_PARAMS.sortDir),
});

export type Resource = z.infer<typeof ResourceSchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;
export type UpdateResource = z.infer<typeof UpdateResourceSchema>;
export type SearchResourcesParams = z.infer<typeof SearchResourcesParamsSchema>;
