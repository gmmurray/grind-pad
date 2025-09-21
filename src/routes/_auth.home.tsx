import {
  GAME_TABS,
  gameTabs,
} from '@/features/games/components/tabs/constants';
import {
  getOwnGameQueryOptions,
  getOwnGamesQueryOptions,
} from '@/features/games/game-queries';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Menu,
  Portal,
  Stack,
} from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { LuEllipsisVertical, LuList, LuPlus } from 'react-icons/lu';

import { useGameDialog } from '@/features/games/components/game-dialog';
import GameTabs from '@/features/games/components/tabs/game-tabs';
import type { Game } from '@/features/games/game-model';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import { DEFAULT_NOTE_SEARCH_PARAMS } from '@/features/notes/note-model';
import { searchOwnGameNotesQueryOptions } from '@/features/notes/note-queries';
import { DEFAULT_RESOURCE_SEARCH_PARAMS } from '@/features/resources/resource-model';
import { searchOwnGameResourcesQueryOptions } from '@/features/resources/resource-queries';
import { getOwnGameTasksQueryOptions } from '@/features/tasks/task-queries';
import z from 'zod';

const LAST_GAME_STORAGE_KEY = 'gp:lastGameId';
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
      getOwnGamesQueryOptions(1, 20),
    );
    const gameFromStorage =
      window.localStorage.getItem(LAST_GAME_STORAGE_KEY) ?? undefined;
    const selectedGameId = gameFromSearch ?? gameFromStorage;

    if (selectedGameId) {
      queryClient.ensureQueryData(
        getOwnGameMetadataQueryOptions(selectedGameId),
      );
      if (!gameList.some(g => g.id === selectedGameId)) {
        await queryClient.ensureQueryData(
          getOwnGameQueryOptions(selectedGameId),
        );
      }

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
});

function RouteComponent() {
  const { open } = useGameDialog();
  const gamesQuery = useSuspenseQuery(getOwnGamesQueryOptions(1, 20));
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

  const selectedGame = unionGames.find(g => g.id === selectedGameId);

  return (
    <Grid
      flex="1"
      templateColumns={{ base: 'none', md: 'repeat(4, 1fr)' }}
      display={{ base: 'flex', md: 'grid' }}
      flexDir={{ base: 'column', md: 'unset' }}
      gap="4"
    >
      {/* SIDEBAR */}
      <GridItem colSpan={{ base: 1, md: 1 }}>
        <Card.Root h="full">
          <Card.Body>
            <Flex alignItems="center" mb="4">
              <Card.Title>my games</Card.Title>
              <Menu.Root positioning={{ placement: 'bottom-end' }}>
                <Menu.Trigger asChild>
                  <IconButton
                    ml="auto"
                    variant="ghost"
                    colorPalette="gray"
                    size="sm"
                    rounded="full"
                  >
                    <LuEllipsisVertical />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        value="add"
                        onClick={() => open({ mode: 'add' })}
                      >
                        <LuPlus />
                        <Box>add</Box>
                      </Menu.Item>
                      <Menu.Item value="manage" asChild>
                        <Link to="/games">
                          <LuList />
                          manage
                        </Link>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Flex>

            <Stack gap="1">
              {unionGames.map(game => {
                return (
                  <Button
                    key={game.id}
                    variant={selectedGame?.id === game.id ? 'subtle' : 'ghost'}
                    onClick={() => {
                      window.localStorage.setItem(
                        LAST_GAME_STORAGE_KEY,
                        game.id,
                      );
                      navigate({
                        search: prev => ({ ...prev, game: game.id }),
                      });
                    }}
                    justifyContent="start"
                  >
                    {game.title}
                  </Button>
                );
              })}
            </Stack>
          </Card.Body>
        </Card.Root>
      </GridItem>

      {/* MAIN AREA */}
      <GridItem colSpan={{ base: 1, md: 3 }} flex={{ base: '1', md: 'unset' }}>
        <Card.Root h="full">
          <Card.Body>
            <Heading size="4xl" mb="4">
              {selectedGame?.title}
            </Heading>

            {/* TABS */}
            <GameTabs
              gameId={selectedGameId}
              tab={tab}
              onTabChange={newTab =>
                navigate({
                  search: prev => ({
                    ...prev,
                    tab: newTab,
                  }),
                })
              }
            />
          </Card.Body>
        </Card.Root>
      </GridItem>
    </Grid>
  );
}

function makeUnionGames(
  games: Game[],
  selectedId?: string,
  selectedFromCache?: Game | null,
): Game[] {
  if (!selectedId) return games;
  const existing = games.find(g => g.id === selectedId);
  if (existing) return games;
  if (selectedFromCache) return [selectedFromCache as Game].concat(games);
  // Minimal placeholder so the selected game is visible until loaded
  return (
    [
      {
        id: selectedId,
        title: '(loading...)',
        user: '',
        created: '',
        updated: '',
      } as Game,
    ] as Game[]
  ).concat(games);
}
