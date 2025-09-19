import { pbClient } from '@/lib/pocketbase';
import { validateModelDbList } from '@/utils/validateModelDbList';
import { getUser } from '../auth/auth-service';
import { NOTES_COLLECTION } from './note-constants';
import {
  type CreateNote,
  CreateNoteSchema,
  type Note,
  NoteSchema,
  type SearchNotesParams,
  SearchNotesParamsSchema,
  type UpdateNote,
  UpdateNoteSchema,
} from './note-model';

export async function getOwnGameNote(
  gameId: string,
  noteId: string,
): Promise<Note | null> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to retrieve note: no user provided');
    return null;
  }

  const dbNote = await pbClient
    .collection(NOTES_COLLECTION)
    .getFirstListItem(
      `id="${noteId}" && user = "${user.id}" && game = "${gameId}"`,
    );

  const validated = NoteSchema.safeParse(dbNote);

  if (!validated.success) {
    console.warn(
      `Invalid note retrieved from database with game id: ${gameId}`,
    );
    return null;
  }

  return validated.data;
}

export async function searchOwnGameNotes(
  searchInput: SearchNotesParams,
): Promise<{ items: Note[]; count: number; totalPages: number }> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to search notes: no user provided');
    return { items: [], count: 0, totalPages: 0 };
  }

  const validatedSearch = SearchNotesParamsSchema.safeParse(searchInput);

  if (!validatedSearch.success) {
    console.warn('Unable to search notes: invalid input');
    throw new Error('Error searching your notes');
  }

  const { gameId, page, perPage, sortBy, sortDir, title, tags } =
    validatedSearch.data;

  // always required filters
  const filters: string[] = [`game="${gameId}"`, `user="${user.id}"`];

  // optional title substring match
  if (title) {
    filters.push(`title~"${title}"`);
  }

  // optional tags filter
  if (tags?.length) {
    // must match *all* tags
    const tagFilters = tags.map(tag => `tags~"${tag}"`);
    filters.push(tagFilters.join(' && '));
  }

  const filterString = filters.join(' && ');

  const sortString = (sortDir === 'desc' ? '-' : '') + sortBy;

  const dbNotes = await pbClient
    .collection(NOTES_COLLECTION)
    .getList(page, perPage, {
      filter: filterString,
      sort: sortString,
    });

  const result = validateModelDbList(dbNotes.items, NoteSchema);
  return {
    items: result,
    count: dbNotes.totalItems,
    totalPages: dbNotes.totalPages,
  };
}

export async function createOwnGameNote({
  gameId,
  input,
}: { gameId: string; input: CreateNote }): Promise<Note> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to create note: no user provided');
    throw new Error('There was an error creating your note');
  }

  const validatedInput = CreateNoteSchema.parse(input);

  const dbNote = await pbClient.collection(NOTES_COLLECTION).create({
    ...validatedInput,
    user: user.id,
    game: gameId,
  });

  return NoteSchema.parse(dbNote);
}

export async function updateOwnGameNote({
  gameId,
  noteId,
  input,
}: { gameId: string; noteId: string; input: UpdateNote }): Promise<Note> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to update note: no user provided');
    throw new Error('There was an error updating your note');
  }

  const validatedInput = UpdateNoteSchema.parse(input);

  const existingNote = await getOwnGameNote(gameId, noteId);

  if (!existingNote) {
    console.warn(
      `Unable to update own note: note with id ${noteId} could not be found`,
    );
    throw new Error('There was an error saving your note');
  }

  const updates: Note = {
    ...existingNote,
    ...validatedInput,
  };

  const validatedUpdates = NoteSchema.parse(updates);

  const updated = await pbClient
    .collection(NOTES_COLLECTION)
    .update(noteId, validatedUpdates);

  return NoteSchema.parse(updated);
}

export async function deleteOwnGameNote({
  gameId,
  noteId,
}: { gameId: string; noteId: string }): Promise<void> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to delete note: no user provided');
    throw new Error('There was an error deleting your note');
  }

  const existingNote = await getOwnGameNote(gameId, noteId);

  if (!existingNote) {
    console.warn(
      `Unable to delete own note: note with id ${noteId} could not be found`,
    );
    throw new Error('There was an error deleting your note');
  }

  await pbClient.collection(NOTES_COLLECTION).delete(noteId);
}
