import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getOwnGameMetadata, updateOwnMetadata } from './metadata-service';

import { buildMutationHook } from '@/hooks/queries';
import type { Metadata } from './metadata-model';

export const METADATA_QUERY_KEY = 'metadata';

export const metadataQueryKeys = {
  getOwnGameMetadata: (gameId: string) => [METADATA_QUERY_KEY, { gameId }],
};

export const getOwnGameMetadataQueryOptions = (gameId: string) =>
  queryOptions({
    queryKey: metadataQueryKeys.getOwnGameMetadata(gameId),
    queryFn: () => getOwnGameMetadata(gameId),
  });

export const useUpdateOwnMetadataMutation = (gameId: string) =>
  buildMutationHook(
    updateOwnMetadata,
    metadataQueryKeys.getOwnGameMetadata(gameId),
  )();

export function useUpdateOwnMetadataNoteTagsMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      operation,
      changedTags,
    }: {
      operation: 'add' | 'remove';
      changedTags: string[];
    }) => {
      const metadata = await queryClient.ensureQueryData(
        getOwnGameMetadataQueryOptions(gameId),
      );

      const existingTags = metadata?.noteTags ?? [];

      let updatedTags: Metadata['noteTags'];

      if (operation === 'add') {
        const deduped = new Set([...existingTags, ...changedTags]);

        updatedTags = [...deduped.values()].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base' }),
        );
      } else if (operation === 'remove') {
        updatedTags = existingTags.filter(t => !changedTags.includes(t));
      } else {
        throw new Error(
          'Unable to update metadata note tags: invalid operation provided',
        );
      }

      return updateOwnMetadata({ gameId, input: { noteTags: updatedTags } });
    },
    onSuccess: () =>
      queryClient.invalidateQueries(getOwnGameMetadataQueryOptions(gameId)),
  });
}
