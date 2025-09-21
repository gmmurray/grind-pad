import {
  GAME_TABS,
  gameTabs,
} from '@/features/games/components/tabs/constants';
import {
  getOwnGameQueryOptions,
  getOwnHomeGamesQueryOptions,
} from '@/features/games/game-queries';
import {
  Box,
  Button,
  Card,
  Collapsible,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Menu,
  Portal,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import {
  LuChevronDown,
  LuEllipsisVertical,
  LuList,
  LuPlus,
} from 'react-icons/lu';

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
      getOwnHomeGamesQueryOptions(),
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
      {/* GAME SELECTOR */}
      <GridItem colSpan={{ base: 1, md: 1 }}>
        <Card.Root h="full" size={{ base: 'sm', md: 'md' }}>
          <Card.Body>
            {/* DESKTOP */}
            <Box display={{ base: 'none', md: 'initial' }}>
              <Flex alignItems="center" mb="4">
                <Text
                  fontSize="lg"
                  color="fg.muted"
                  display={{ base: 'none', md: 'initial' }}
                >
                  games
                </Text>
                <Box ml="auto">
                  <Menu.Root positioning={{ placement: 'bottom-end' }}>
                    <Menu.Trigger asChild>
                      <IconButton
                        variant="ghost"
                        colorPalette="gray"
                        size="sm"
                        rounded="full"
                      >
                        <LuEllipsisVertical />
                      </IconButton>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner
                        display={{ base: 'none', md: 'initial' }}
                      >
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
                </Box>
              </Flex>

              <Stack gap="1">
                {unionGames.map(game => {
                  return (
                    <Button
                      key={game.id}
                      colorPalette="gray"
                      variant={
                        selectedGame?.id === game.id ? 'subtle' : 'ghost'
                      }
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
            </Box>

            {/* MOBILE */}
            <Box display={{ base: 'initial', md: 'none' }}>
              <Collapsible.Root>
                <Collapsible.Trigger w="full">
                  <Flex alignItems="center">
                    <Text
                      fontSize="lg"
                      color="fg.muted"
                      display={{ base: 'initial', md: 'none' }}
                    >
                      {selectedGame?.title}
                    </Text>
                    <Box ml="auto">{<LuChevronDown />}</Box>
                  </Flex>
                </Collapsible.Trigger>

                <Collapsible.Content>
                  <Separator mt="2" />
                  <Flex>
                    <Button
                      type="button"
                      variant="ghost"
                      ml="-4"
                      onClick={() => open({ mode: 'add' })}
                    >
                      add game
                    </Button>
                    <Button type="button" variant="ghost" ml="auto" mr="-4">
                      manage games
                    </Button>
                  </Flex>

                  <Separator mt="1" />

                  <Stack gap="1">
                    {unionGames.map(game => {
                      return (
                        <Button
                          key={game.id}
                          colorPalette="gray"
                          variant={
                            selectedGame?.id === game.id ? 'subtle' : 'ghost'
                          }
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
                </Collapsible.Content>
              </Collapsible.Root>
            </Box>
          </Card.Body>
        </Card.Root>
      </GridItem>

      {/* MAIN AREA */}
      <GridItem colSpan={{ base: 1, md: 3 }} flex={{ base: '1', md: 'unset' }}>
        <Card.Root h="full" size={{ base: 'sm', md: 'md' }}>
          <Card.Body>
            <Heading
              size="4xl"
              mb="4"
              display={{ base: 'none', md: 'initial' }}
            >
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
