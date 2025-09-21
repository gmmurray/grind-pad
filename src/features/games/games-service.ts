import { pbClient } from '@/lib/pocketbase';
import { validateModelDbList } from '@/utils/validateModelDbList';
import { getUser } from '../auth/auth-service';
import { createOwnMetadata } from '../metadata/metadata-service';
import { GAMES_COLLECTION } from './game-constants';
import {
  type CreateGame,
  CreateGameSchema,
  type Game,
  GameSchema,
  type UpdateGame,
  UpdateGameSchema,
} from './game-model';

export async function getOwnGame(gameId: string): Promise<Game | null> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to retrieve game: no user provided');
    return null;
  }

  const dbGame = await pbClient
    .collection(GAMES_COLLECTION)
    .getFirstListItem(`id="${gameId}" && user = "${user.id}"`);

  const validated = GameSchema.safeParse(dbGame);

  if (!validated.success) {
    console.warn(`Invalid game retrieved from database with id: ${gameId}`);
    return null;
  }

  return validated.data;
}

export async function getOwnHomeGames(): Promise<Game[]> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to retrieve games: no user provided');
    return [];
  }

  const dbGames = await pbClient.collection(GAMES_COLLECTION).getList(1, 5, {
    filter: `user="${user.id}"`,
    sort: '-created',
  });

  return validateModelDbList(dbGames.items, GameSchema);
}

export async function getOwnGames(page = 1, perPage = 20): Promise<Game[]> {
  const user = getUser();

  if (!user) {
    console.warn('Unable to retrieve games: no user provided');
    return [];
  }

  const list = await pbClient
    .collection(GAMES_COLLECTION)
    .getList(page, perPage, { filter: `user = "${user.id}"` });

  const results: Game[] = [];
  for (const g of list.items) {
    const validated = GameSchema.safeParse(g);

    if (!validated.success) {
      console.warn(`Invalid game retrieved from database with id: ${g.id}`);
      continue;
    }
    results.push(validated.data);
  }

  return results;
}

export async function createOwnGame(input: CreateGame): Promise<Game> {
  const validatedInput = CreateGameSchema.parse(input);

  const user = getUser();

  if (!user) {
    console.warn('Unable to create own game: no user provided');
    throw new Error('There was an error creating your game');
  }

  const dbGame = await pbClient
    .collection(GAMES_COLLECTION)
    .create({ ...validatedInput, user: user.id });

  const validatedDbGame = GameSchema.parse(dbGame);

  // non-blocking metadata creation
  createOwnMetadata({
    gameId: validatedDbGame.id,
    input: {
      noteTags: [],
      resourceTags: [],
    },
  });

  return validatedDbGame;
}

export async function updateOwnGame({
  gameId,
  input,
}: { gameId: string; input: UpdateGame }): Promise<Game> {
  const validatedInput = UpdateGameSchema.parse(input);

  const existingGame = await getOwnGame(gameId);

  if (!existingGame) {
    console.warn(
      `Unable to update own game: game with id ${gameId} could not be found`,
    );
    throw new Error('There was an error saving your game');
  }

  const updates: Game = {
    ...existingGame,
    ...validatedInput,
  };

  const validatedUpdates = GameSchema.parse(updates);

  const updated = await pbClient
    .collection(GAMES_COLLECTION)
    .update(validatedUpdates.id, validatedUpdates);

  return GameSchema.parse(updated);
}

export async function deleteOwnGame(gameId: string): Promise<void> {
  await pbClient.collection(GAMES_COLLECTION).delete(gameId);
}
