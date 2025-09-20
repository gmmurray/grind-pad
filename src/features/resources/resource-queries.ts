import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CreateResource,
  SearchResourcesParams,
  UpdateResource,
} from './resource-model';
import {
  createOwnGameResource,
  deleteOwnGameResource,
  searchOwnGameResources,
  updateOwnGameResource,
} from './resources-service';

import { buildMutationHook } from '@/hooks/queries';
import { useUpdateOwnMetadataTagsMutation } from '../metadata/metadata-queries';

export const RESOURCES_QUERY_KEY = 'resources';

export const resourcesQuerykeys = {
  searchOwnGameResources: {
    all: (gameId: string) => [
      RESOURCES_QUERY_KEY,
      'own-game-resources',
      gameId,
    ],
    params: (searchParams: SearchResourcesParams) => [
      RESOURCES_QUERY_KEY,
      'own-game-resources',
      searchParams.gameId,
      { ...searchParams },
    ],
  },
};

export const searchOwnGameResourcesQueryOptions = (
  searchParams: SearchResourcesParams,
) =>
  queryOptions({
    queryKey: resourcesQuerykeys.searchOwnGameResources.params(searchParams),
    queryFn: () => searchOwnGameResources(searchParams),
  });

export function useCreateOwnGameResourceMutation(gameId: string) {
  const queryClient = useQueryClient();
  const metadataMutation = useUpdateOwnMetadataTagsMutation(gameId);

  return useMutation({
    mutationFn: (input: CreateResource) =>
      createOwnGameResource({ gameId, input }),
    onSuccess: resource => {
      // update resource tags metadata
      if (resource.tags.length > 0) {
        metadataMutation.mutate({
          operation: 'add',
          changedTags: resource.tags,
          field: 'resourceTags',
        });
      }

      queryClient.invalidateQueries({
        queryKey: resourcesQuerykeys.searchOwnGameResources.all(gameId),
      });
    },
  });
}

export function useUpdateOwnGameResourceMutation(gameId: string) {
  const queryClient = useQueryClient();
  const metadataMutation = useUpdateOwnMetadataTagsMutation(gameId);

  return useMutation({
    mutationFn: ({
      resourceId,
      input,
    }: {
      resourceId: string;
      input: UpdateResource;
    }) => updateOwnGameResource({ gameId, resourceId, input }),
    onSuccess: resource => {
      // ensure new tags are reflected in the metadata
      if (resource.tags.length > 0) {
        metadataMutation.mutate({
          operation: 'add',
          changedTags: resource.tags,
          field: 'resourceTags',
        });
      }

      queryClient.invalidateQueries({
        queryKey: resourcesQuerykeys.searchOwnGameResources.all(gameId),
      });
    },
  });
}

export const useDeleteOwnGameResourceMutation = (gameId: string) =>
  buildMutationHook(
    deleteOwnGameResource,
    resourcesQuerykeys.searchOwnGameResources.all(gameId),
  )();
