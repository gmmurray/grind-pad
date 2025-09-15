import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateNote, SearchNotesParams, UpdateNote } from './note-model';
import {
  createOwnGameNote,
  deleteOwnGameNote,
  searchOwnGameNotes,
  updateOwnGameNote,
} from './notes-service';

import { buildMutationHook } from '@/hooks/queries';
import { useUpdateOwnMetadataNoteTagsMutation } from '../metadata/metadata-queries';

export const NOTES_QUERY_KEY = 'notes';

export const noteQueryKeys = {
  searchOwnGameNotes: {
    all: (gameId: string) => [NOTES_QUERY_KEY, 'own-game-notes', gameId],
    params: (searchParams: SearchNotesParams) => [
      NOTES_QUERY_KEY,
      'own-game-notes',
      searchParams.gameId,
      { ...searchParams },
    ],
  },
};

export const searchOwnGameNotesQueryOptions = (
  searchParams: SearchNotesParams,
) =>
  queryOptions({
    queryKey: noteQueryKeys.searchOwnGameNotes.params(searchParams),
    queryFn: () => searchOwnGameNotes(searchParams),
  });

export function useCreateOwnGameNoteMutation(gameId: string) {
  const queryClient = useQueryClient();
  const metadataMutation = useUpdateOwnMetadataNoteTagsMutation(gameId);

  return useMutation({
    mutationFn: (input: CreateNote) => createOwnGameNote({ gameId, input }),
    onSuccess: note => {
      // update note tags metadata
      if (note.tags.length > 0) {
        metadataMutation.mutate({
          operation: 'add',
          changedTags: note.tags,
        });
      }

      queryClient.invalidateQueries({
        queryKey: noteQueryKeys.searchOwnGameNotes.all(gameId),
      });
    },
  });
}

export function useUpdateOwnGameNoteMutation(gameId: string) {
  const queryClient = useQueryClient();
  const metadataMutation = useUpdateOwnMetadataNoteTagsMutation(gameId);

  return useMutation({
    mutationFn: ({
      noteId,
      input,
    }: {
      noteId: string;
      input: UpdateNote;
    }) => updateOwnGameNote({ gameId, noteId, input }),
    onSuccess: note => {
      // ensure new tags are reflected in metadata
      if (note.tags.length > 0) {
        metadataMutation.mutate({
          operation: 'add',
          changedTags: note.tags,
        });
      }

      queryClient.invalidateQueries({
        queryKey: noteQueryKeys.searchOwnGameNotes.all(gameId),
      });
    },
  });
}

export const useDeleteOwnGameNoteMutation = (gameId: string) =>
  buildMutationHook(
    deleteOwnGameNote,
    noteQueryKeys.searchOwnGameNotes.all(gameId),
  )();
