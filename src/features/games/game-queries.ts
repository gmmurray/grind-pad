import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createOwnGame,
  deleteOwnGame,
  getOwnGame,
  getOwnHomeGames,
  searchOwnGames,
  updateOwnGame,
} from './games-service';

import { buildMutationHook } from '@/hooks/queries';
import type { SearchGamesParams } from './game-model';

export const GAMES_QUERY_KEY = 'games';

export const gameQueryKeys = {
  getOwnGame: (gameId: string) => [GAMES_QUERY_KEY, 'own-game', { gameId }],
  getOwnGames: {
    all: [GAMES_QUERY_KEY, 'own-games'],
    home: [GAMES_QUERY_KEY, 'own-games', 'home'],
    search: (searchParams: SearchGamesParams) => [
      GAMES_QUERY_KEY,
      'own-games',
      { ...searchParams },
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

export const searchOwnGamesQueryOptions = (searchParams: SearchGamesParams) =>
  queryOptions({
    queryKey: gameQueryKeys.getOwnGames.search(searchParams),
    queryFn: () => searchOwnGames(searchParams),
  });

export const useCreateOwnGameMutation = buildMutationHook(
  createOwnGame,
  gameQueryKeys.getOwnGames.all,
);

export const useUpdateOwnGameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOwnGame,
    onSuccess: async game => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: gameQueryKeys.getOwnGames.all,
        }),
        queryClient.invalidateQueries(getOwnGameQueryOptions(game.id)),
      ]);
    },
  });
};

export const useDeleteOwnGameMutation = buildMutationHook(
  deleteOwnGame,
  gameQueryKeys.getOwnGames.all,
);
