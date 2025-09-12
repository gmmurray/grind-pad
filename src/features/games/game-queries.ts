import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { createOwnGame, getOwnGame, getOwnGames } from './games-service';

export const GAMES_QUERY_KEY = 'games';

export const gameQueryKeys = {
  getOwnGame: (gameId: string) => [GAMES_QUERY_KEY, 'own-game', { gameId }],
  getOwnGames: {
    all: [GAMES_QUERY_KEY, 'own-games'],
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

export const getOwnGamesQueryOptions = (page = 1, perPage = 20) =>
  queryOptions({
    queryKey: gameQueryKeys.getOwnGames.paged(page, perPage),
    queryFn: () => getOwnGames(page, perPage),
  });

export const useCreateOwnGameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOwnGame,
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: gameQueryKeys.getOwnGames.all,
      }),
  });
};
