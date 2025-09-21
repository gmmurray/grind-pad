import {
  createOwnGame,
  deleteOwnGame,
  getOwnGame,
  getOwnGames,
  getOwnHomeGames,
  updateOwnGame,
} from './games-service';

import { buildMutationHook } from '@/hooks/queries';
import { queryOptions } from '@tanstack/react-query';

export const GAMES_QUERY_KEY = 'games';

export const gameQueryKeys = {
  getOwnGame: (gameId: string) => [GAMES_QUERY_KEY, 'own-game', { gameId }],
  getOwnGames: {
    all: [GAMES_QUERY_KEY, 'own-games'],
    home: [GAMES_QUERY_KEY, 'own-games', 'home'],
    paged: (page: number, perPage: number) => [
      GAMES_QUERY_KEY,
      'own-games',
      { page, perPage },
    ],
  },
};

export const getOwnGameQueryOptions = (gameId: string) =>
  queryOptions({
    queryKey: gameQueryKeys.getOwnGame(gameId),
    queryFn: () => getOwnGame(gameId),
  });

export const getOwnHomeGamesQueryOptions = () =>
  queryOptions({
    queryKey: gameQueryKeys.getOwnGames.home,
    queryFn: () => getOwnHomeGames(),
  });

export const getOwnGamesQueryOptions = (page = 1, perPage = 20) =>
  queryOptions({
    queryKey: gameQueryKeys.getOwnGames.paged(page, perPage),
    queryFn: () => getOwnGames(page, perPage),
  });

export const useCreateOwnGameMutation = buildMutationHook(
  createOwnGame,
  gameQueryKeys.getOwnGames.all,
);

export const useUpdateOwnGameMutation = buildMutationHook(
  updateOwnGame,
  gameQueryKeys.getOwnGames.all,
);

export const useDeleteOwnGameMutation = buildMutationHook(
  deleteOwnGame,
  gameQueryKeys.getOwnGames.all,
);
