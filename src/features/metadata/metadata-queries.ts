import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getOwnGameMetadata, updateOwnMetadata } from './metadata-service';

import { buildMutationHook } from '@/hooks/queries';
import { alphabeticalDedupe } from '@/utils/dedupe';
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

export function useUpdateOwnMetadataTagsMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      operation,
      changedTags,
      field,
    }: {
      operation: 'add' | 'remove';
      changedTags: string[];
      field: 'noteTags' | 'resourceTags';
    }) => {
      const metadata = await queryClient.ensureQueryData(
        getOwnGameMetadataQueryOptions(gameId),
      );

      const existingTags = metadata?.[field] ?? [];

      let updatedTags: Metadata[typeof field];

      if (operation === 'add') {
        updatedTags = alphabeticalDedupe([...existingTags, ...changedTags]);
      } else if (operation === 'remove') {
        updatedTags = existingTags.filter(t => !changedTags.includes(t));
      } else {
        throw new Error(
          `Unable to update metadata ${field}: invalid operation provided`,
        );
      }

      return updateOwnMetadata({ gameId, input: { [field]: updatedTags } });
    },
    onSuccess: () =>
      queryClient.invalidateQueries(getOwnGameMetadataQueryOptions(gameId)),
  });
}
