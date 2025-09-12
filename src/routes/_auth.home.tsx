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
  Tabs,
} from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { LuEllipsisVertical, LuList, LuPlus } from 'react-icons/lu';

import { useGameDialog } from '@/features/games/components/game-dialog';
import type { Game } from '@/features/games/game-model';
import { useEffect, useMemo } from 'react';
import z from 'zod';

const LAST_GAME_STORAGE_KEY = 'gp:lastGameId';

const searchSchema = z.object({
  game: z.string().optional(),
  tab: z.enum(['tasks', 'notes', 'resources']).optional().default('tasks'),
});

type SearchSchema = z.infer<typeof searchSchema>;

export const Route = createFileRoute('/_auth/home')({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { game } }) => ({ game }),
  loader: async ({
    context: { queryClient },
    deps: { game: gameFromSearch },
  }) => {
    const gameList = await queryClient.ensureQueryData(
      getOwnGamesQueryOptions(1, 20),
    );
    const gameFromStorage =
      window.localStorage.getItem(LAST_GAME_STORAGE_KEY) ?? undefined;
    const selectedGameId = gameFromSearch ?? gameFromStorage;
    if (selectedGameId && !gameList.some(g => g.id === selectedGameId)) {
      await queryClient.ensureQueryData(getOwnGameQueryOptions(selectedGameId));
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
  const selectedId = gameIdParam ?? lastStoredId ?? gamesQuery.data[0]?.id;

  const selectedOffPage = !!selectedId && !gamesQuery.data.some(g => g.id === selectedId);
  const { data: selectedFromCache } = useQuery({
    ...getOwnGameQueryOptions(selectedId ?? '__none__'),
    enabled: !!selectedId && selectedOffPage,
  });

  // Keep localStorage in sync with current selection
  useEffect(() => {
    if (selectedId && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LAST_GAME_STORAGE_KEY, selectedId);
      } catch {}
    }
  }, [selectedId]);

  // Build a union list so selected game shows even if off-page
  const unionGames = useMemo(
    () => makeUnionGames(gamesQuery.data, selectedId, selectedFromCache as Game | null | undefined),
    [gamesQuery.data, selectedId, selectedFromCache],
  );

  const selectedGame = unionGames.find(g => g.id === selectedId);

  return (
    <Grid
      flex="1"
      templateColumns={{ base: 'none', md: 'repeat(4, 1fr)' }}
      display={{ base: 'flex', md: 'grid' }}
      flexDir={{ base: 'column', md: 'unset' }}
      gap="4"
    >
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
      <GridItem colSpan={{ base: 1, md: 3 }} flex={{ base: '1', md: 'unset' }}>
        <Card.Root h="full">
          <Card.Body>
            <Heading size="4xl" mb="4">
              {selectedGame?.title}
            </Heading>
            <Tabs.Root
              variant="enclosed"
              fitted
              value={tab}
              onValueChange={e =>
                navigate({
                  search: prev => ({
                    ...prev,
                    tab: e.value as SearchSchema['tab'],
                  }),
                })
              }
            >
              <Tabs.List>
                <Tabs.Trigger value="tasks">tasks</Tabs.Trigger>
                <Tabs.Trigger value="notes">notes</Tabs.Trigger>
                <Tabs.Trigger value="resources">resources</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="tasks">
                <Heading>tasks</Heading>
              </Tabs.Content>

              <Tabs.Content value="notes">
                <Heading>notes</Heading>
              </Tabs.Content>

              <Tabs.Content value="resources">
                <Heading>resources</Heading>
              </Tabs.Content>
            </Tabs.Root>
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
