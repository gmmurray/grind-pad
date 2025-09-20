import { TimestampSchema } from '@/lib/pocketbase';
import z from 'zod';

export const MetadataSchema = z
  .object({
    id: z.string(),
    user: z.string(),
    game: z.string(),
    noteTags: z.array(z.string()).default([]),
    resourceTags: z.array(z.string()).default([]),
  })
  .extend(TimestampSchema.shape);

export const CreateMetadataSchema = z.object({
  noteTags: MetadataSchema.shape.noteTags,
  resourceTags: MetadataSchema.shape.resourceTags,
});

export const UpdateMetadataSchema = z.object({
  noteTags: MetadataSchema.shape.noteTags.optional(),
  resourceTags: MetadataSchema.shape.resourceTags.optional(),
});

export type Metadata = z.infer<typeof MetadataSchema>;
export type CreateMetadata = z.infer<typeof CreateMetadataSchema>;
export type UpdateMetadata = z.infer<typeof UpdateMetadataSchema>;
