import {
  getOwnGameQueryOptions,
  getOwnHomeGamesQueryOptions,
} from '@/features/games/game-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo } from 'react';

import ErrorView from '@/components/error-view';
import GameDashboard from '@/features/games/components/dashboard/game-dashboard';
import NoGames from '@/features/games/components/no-games';
import {
  GAME_TABS,
  type GameTab,
  LAST_GAME_STORAGE_KEY,
  gameTabs,
} from '@/features/games/game-constants';
import type { Game } from '@/features/games/game-model';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import { DEFAULT_NOTE_SEARCH_PARAMS } from '@/features/notes/note-model';
import { searchOwnGameNotesQueryOptions } from '@/features/notes/note-queries';
import { DEFAULT_RESOURCE_SEARCH_PARAMS } from '@/features/resources/resource-model';
import { searchOwnGameResourcesQueryOptions } from '@/features/resources/resource-queries';
import { getOwnGameTasksQueryOptions } from '@/features/tasks/task-queries';
import z from 'zod';

const searchSchema = z.object({
  game: z.string().optional(),
  tab: z.enum(gameTabs).optional().default('tasks'),
});

export const Route = createFileRoute('/_auth/home')({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { game, tab } }) => ({ game, tab }),
  loader: async ({
    context: { queryClient },
    deps: { game: gameFromSearch, tab: tabFromSearch },
  }) => {
    const gameList = await queryClient.ensureQueryData(
      getOwnHomeGamesQueryOptions(),
    );
    const gameFromStorage =
      window.localStorage.getItem(LAST_GAME_STORAGE_KEY) ?? undefined;
    const selectedGameId = gameFromSearch ?? gameFromStorage;

    if (selectedGameId) {
      if (!gameList.some(g => g.id === selectedGameId)) {
        await queryClient.ensureQueryData(
          getOwnGameQueryOptions(selectedGameId),
        );
      }
      queryClient.ensureQueryData(
        getOwnGameMetadataQueryOptions(selectedGameId),
      );

      if (tabFromSearch === GAME_TABS.NOTES) {
        // prefetch tasks and resources
        queryClient.prefetchQuery(getOwnGameTasksQueryOptions(selectedGameId));
        queryClient.prefetchQuery(
          searchOwnGameResourcesQueryOptions({
            ...DEFAULT_RESOURCE_SEARCH_PARAMS,
            gameId: selectedGameId,
          }),
        );
        await queryClient.ensureQueryData(
          searchOwnGameNotesQueryOptions({
            ...DEFAULT_NOTE_SEARCH_PARAMS,
            gameId: selectedGameId,
          }),
        );
      } else if (tabFromSearch === GAME_TABS.RESOURCES) {
        queryClient.prefetchQuery(getOwnGameTasksQueryOptions(selectedGameId));
        queryClient.prefetchQuery(
          searchOwnGameNotesQueryOptions({
            ...DEFAULT_NOTE_SEARCH_PARAMS,
            gameId: selectedGameId,
          }),
        );
        await queryClient.ensureQueryData(
          searchOwnGameResourcesQueryOptions({
            ...DEFAULT_RESOURCE_SEARCH_PARAMS,
            gameId: selectedGameId,
          }),
        );
      } else {
        queryClient.prefetchQuery(
          searchOwnGameNotesQueryOptions({
            ...DEFAULT_NOTE_SEARCH_PARAMS,
            gameId: selectedGameId,
          }),
        );
        queryClient.prefetchQuery(
          searchOwnGameResourcesQueryOptions({
            ...DEFAULT_RESOURCE_SEARCH_PARAMS,
            gameId: selectedGameId,
          }),
        );
        await queryClient.ensureQueryData(
          getOwnGameTasksQueryOptions(selectedGameId),
        );
      }
    }
  },
  component: RouteComponent,
  errorComponent: () => {
    return <ErrorView loader />;
  },
});

function RouteComponent() {
  const gamesQuery = useSuspenseQuery(getOwnHomeGamesQueryOptions());
  const navigate = useNavigate({ from: Route.fullPath });
  const { game: gameIdParam, tab } = Route.useSearch();

  const lastStoredId =
    typeof window !== 'undefined'
      ? (window.localStorage.getItem(LAST_GAME_STORAGE_KEY) ?? undefined)
      : undefined;
  const selectedGameId = gameIdParam ?? lastStoredId ?? gamesQuery.data[0]?.id;

  const selectedOffPage =
    !!selectedGameId && !gamesQuery.data.some(g => g.id === selectedGameId);
  const { data: selectedFromCache } = useQuery({
    ...getOwnGameQueryOptions(selectedGameId ?? '__none__'),
    enabled: !!selectedGameId && selectedOffPage,
  });

  // Keep localStorage in sync with current selection
  useEffect(() => {
    if (selectedGameId && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LAST_GAME_STORAGE_KEY, selectedGameId);
      } catch {}
    }
  }, [selectedGameId]);

  const hasNoGames = gamesQuery.data.length === 0 && !selectedFromCache;

  // Build a union list so selected game shows even if off-page
  const unionGames = useMemo(
    () =>
      makeUnionGames(
        gamesQuery.data,
        selectedGameId,
        selectedFromCache as Game | null | undefined,
      ),
    [gamesQuery.data, selectedGameId, selectedFromCache],
  );

  const selectedGame = unionGames.find(g => g.id === selectedGameId)!;

  const handleSelectGame = useCallback(
    (gameId: string) => {
      window.localStorage.setItem(LAST_GAME_STORAGE_KEY, gameId);
      navigate({
        search: prev => ({ ...prev, game: gameId }),
      });
    },
    [navigate],
  );

  const handleTabChange = useCallback(
    (value: GameTab) => {
      navigate({
        search: prev => ({
          ...prev,
          tab: value,
        }),
      });
    },
    [navigate],
  );

  if (hasNoGames) {
    return <NoGames />;
  }

  return (
    <GameDashboard
      games={unionGames}
      selectedGame={selectedGame}
      selectedTab={tab}
      onSelectGame={handleSelectGame}
      onTabChange={handleTabChange}
    />
  );
}

function makeUnionGames(
  games: Game[],
  selectedId?: string,
  selectedFromCache?: Game | null,
): Game[] {
  if (!selectedId) {
    return games;
  }

  const existing = games.findIndex(g => g.id === selectedId);

  if (existing >= 0) {
    return games;
  }

  if (selectedFromCache) {
    return [selectedFromCache].concat(games);
  }

  // Minimal placeholder so the selected game is visible until loaded
  return [
    {
      id: selectedId,
      title: 'loading...',
      user: '',
      created: '',
      updated: '',
    },
    ...games,
  ];
}
