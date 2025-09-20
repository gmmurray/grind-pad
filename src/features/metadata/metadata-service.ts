import { pbClient } from '@/lib/pocketbase';
import { ClientResponseError } from 'pocketbase';
import { getUser } from '../auth/auth-service';
import { METADATA_COLLECTION } from './metadata-constants';
import {
  type CreateMetadata,
  CreateMetadataSchema,
  type Metadata,
  MetadataSchema,
  type UpdateMetadata,
  UpdateMetadataSchema,
} from './metadata-model';

export async function getOwnGameMetadata(
  gameId: string,
): Promise<Metadata | null> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to retrieve metadata: no user provided');
    return null;
  }

  let foundMetadata: Metadata;
  try {
    const dbMetadata = await pbClient
      .collection(METADATA_COLLECTION)
      .getFirstListItem(`user="${user.id}" && game="${gameId}"`);

    const validated = MetadataSchema.safeParse(dbMetadata);

    if (!validated.success) {
      console.warn(
        `Invalid metadata retrieved from database with game id: ${gameId}`,
      );
      return null;
    }

    return validated.data;
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      foundMetadata = await createOwnMetadata({
        gameId,
        input: {
          noteTags: [],
          resourceTags: [],
        },
      });
    } else {
      throw error;
    }
  }

  return foundMetadata;
}

export async function createOwnMetadata({
  gameId,
  input,
}: { gameId: string; input: CreateMetadata }): Promise<Metadata> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to create metadata: no user provided');
    throw new Error('There was an error creating your metadata');
  }

  const validatedInput = CreateMetadataSchema.parse(input);

  const dbMetadata = await pbClient.collection(METADATA_COLLECTION).create({
    ...validatedInput,
    user: user.id,
    game: gameId,
  });

  return MetadataSchema.parse(dbMetadata);
}

export async function updateOwnMetadata({
  gameId,
  input,
}: {
  gameId: string;
  input: UpdateMetadata;
}): Promise<Metadata> {
  const validatedInput = UpdateMetadataSchema.parse(input);

  const existingMetadata = await getOwnGameMetadata(gameId);

  if (!existingMetadata) {
    console.warn(
      `Unable to update own metadata: metadata for game id ${gameId} could not be found`,
    );
    throw new Error('There was an error saving your metadata');
  }

  const updates: Metadata = {
    ...existingMetadata,
    ...validatedInput,
  };

  const validatedUpdates = MetadataSchema.parse(updates);

  const updated = await pbClient
    .collection(METADATA_COLLECTION)
    .update(existingMetadata.id, validatedUpdates);

  return MetadataSchema.parse(updated);
}
