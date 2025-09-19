import { SORT_DIRECTION, sortDir } from '@/lib/zod/common';

import { TimestampSchema } from '@/lib/pocketbase';
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

export const DEFAULT_NOTE_SEARCH_PARAMS = {
  page: 1,
  perPage: 6,
  sortBy: NOTES_SORT_BY.UPDATED,
  sortDir: SORT_DIRECTION.DESC,
};
export const SearchNotesParamsSchema = z.object({
  gameId: z.string(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().optional().default(DEFAULT_NOTE_SEARCH_PARAMS.page),
  perPage: z.number().optional().default(DEFAULT_NOTE_SEARCH_PARAMS.perPage),
  sortBy: z
    .enum(notesSortBy)
    .optional()
    .default(DEFAULT_NOTE_SEARCH_PARAMS.sortBy),
  sortDir: sortDir.default(DEFAULT_NOTE_SEARCH_PARAMS.sortDir),
});

export type Note = z.infer<typeof NoteSchema>;
export type CreateNote = z.infer<typeof CreateNoteSchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesParamsSchema>;
