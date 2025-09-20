import { pbClient } from '@/lib/pocketbase';
import { validateModelDbList } from '@/utils/validateModelDbList';
import { getUser } from '../auth/auth-service';
import type { SearchResult } from '../shared/types';
import { RESOURCES_COLLECTION } from './resource-constants';
import {
  type CreateResource,
  CreateResourceSchema,
  type Resource,
  ResourceSchema,
  type SearchResourcesParams,
  SearchResourcesParamsSchema,
  type UpdateResource,
  UpdateResourceSchema,
} from './resource-model';

export async function getOwnGameResource(
  gameId: string,
  resourceId: string,
): Promise<Resource | null> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to retrieve resource: no user provided');
    return null;
  }

  const dbResource = await pbClient
    .collection(RESOURCES_COLLECTION)
    .getFirstListItem(
      `id="${resourceId}" && user = "${user.id}" && game = "${gameId}"`,
    );

  const validated = ResourceSchema.safeParse(dbResource);

  if (!validated.success) {
    console.warn(
      `Invalid resource retrieved from database with game id: ${gameId}`,
    );
    return null;
  }

  return validated.data;
}

export async function searchOwnGameResources(
  searchInput: SearchResourcesParams,
): Promise<SearchResult<Resource>> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to search resources: no user provided');
    return { items: [], count: 0, totalPages: 0 };
  }

  const validatedSearch = SearchResourcesParamsSchema.safeParse(searchInput);

  if (!validatedSearch.success) {
    console.warn('Unable to search resources: invalid input');
    throw new Error('Error searching your resources');
  }

  const { gameId, page, perPage, sortBy, sortDir, text, tags } =
    validatedSearch.data;

  // always required filters
  const filters: string[] = [`game="${gameId}"`, `user="${user.id}"`];

  // optional title, url substring match
  if (text) {
    filters.push(`title~"${text}" || url~${text}`);
  }

  // optional tags filter
  if (tags?.length) {
    // must match *all* tags
    const tagFilters = tags.map(tag => `tags~"${tag}"`);
    filters.push(tagFilters.join(' && '));
  }

  const filterString = filters.join(' && ');

  const sortString = (sortDir === 'desc' ? '-' : '') + sortBy;

  const dbResources = await pbClient
    .collection(RESOURCES_COLLECTION)
    .getList(page, perPage, {
      filter: filterString,
      sort: sortString,
    });

  const result = validateModelDbList(dbResources.items, ResourceSchema);
  return {
    items: result,
    count: dbResources.totalItems,
    totalPages: dbResources.totalPages,
  };
}

export async function createOwnGameResource({
  gameId,
  input,
}: { gameId: string; input: CreateResource }): Promise<Resource> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to create resource: no user provided');
    throw new Error('There was an error creating your resource');
  }

  const validatedInput = CreateResourceSchema.parse(input);

  const dbResource = await pbClient.collection(RESOURCES_COLLECTION).create({
    ...validatedInput,
    user: user.id,
    game: gameId,
  });

  return ResourceSchema.parse(dbResource);
}

export async function updateOwnGameResource({
  gameId,
  resourceId,
  input,
}: {
  gameId: string;
  resourceId: string;
  input: UpdateResource;
}): Promise<Resource> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to update resource: no user provided');
    throw new Error('There was an error updating your resource');
  }

  const validatedInput = UpdateResourceSchema.parse(input);

  const existingResource = await getOwnGameResource(gameId, resourceId);

  if (!existingResource) {
    console.warn(
      `Unable to update own resource: resource with id ${resourceId} could not be found`,
    );
    throw new Error('There was an error saving your resource');
  }

  const updates: Resource = {
    ...existingResource,
    ...validatedInput,
  };

  const validatedUpdates = ResourceSchema.parse(updates);

  const updated = await pbClient
    .collection(RESOURCES_COLLECTION)
    .update(resourceId, validatedUpdates);

  return ResourceSchema.parse(updated);
}

export async function deleteOwnGameResource({
  gameId,
  resourceId,
}: { gameId: string; resourceId: string }): Promise<void> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to delete resource: no user provided');
    throw new Error('There was an error deleting your resource');
  }

  const existingResource = await getOwnGameResource(gameId, resourceId);

  if (!existingResource) {
    console.warn(
      `Unable to delete own resource: resource with id ${resourceId} could not be found`,
    );
    throw new Error('There was an error deleting your resource');
  }

  await pbClient.collection(RESOURCES_COLLECTION).delete(resourceId);
}
