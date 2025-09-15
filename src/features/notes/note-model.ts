import { TimestampSchema } from '@/lib/pocketbase';
import { sortDir } from '@/lib/zod/common';
import z from 'zod';

export const NoteSchema = z
  .object({
    id: z.string(),
    user: z.string(),
    game: z.string(),
    title: z.string().min(1, 'Title is required'),
    content: z.string(),
    tags: z.array(z.string()),
  })
  .extend(TimestampSchema.shape);

export const CreateNoteSchema = z.object({
  title: NoteSchema.shape.title,
  content: NoteSchema.shape.content,
  tags: NoteSchema.shape.tags,
});

export const UpdateNoteSchema = z.object({
  title: NoteSchema.shape.title,
  content: NoteSchema.shape.content,
  tags: NoteSchema.shape.tags,
});

export const NOTES_SORT_BY = {
  TITLE: 'title',
  UPDATED: 'updated',
} as const;
export const notesSortBy = Object.values(NOTES_SORT_BY);
export type NotesSortBy = (typeof notesSortBy)[number];

export const SearchNotesParamsSchema = z.object({
  gameId: z.string(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(5),
  sortBy: z.enum(notesSortBy).default(NOTES_SORT_BY.UPDATED),
  sortDir: sortDir,
});

export type Note = z.infer<typeof NoteSchema>;
export type CreateNote = z.infer<typeof CreateNoteSchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesParamsSchema>;
