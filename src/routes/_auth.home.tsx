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
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { LuEllipsisVertical, LuList, LuPlus } from 'react-icons/lu';

import { useGameDialog } from '@/features/games/components/game-dialog';
import { getOwnGamesQueryOptions } from '@/features/games/game-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import z from 'zod';

const searchSchema = z.object({
  game: z.string().optional(),
  tab: z.enum(['tasks', 'notes', 'resources']).optional().default('tasks'),
});

type SearchSchema = z.infer<typeof searchSchema>;

export const Route = createFileRoute('/_auth/home')({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getOwnGamesQueryOptions(1, 20));
  },
  validateSearch: searchSchema,
});

function RouteComponent() {
  const { open } = useGameDialog();
  const gamesQuery = useSuspenseQuery(getOwnGamesQueryOptions(1, 20));
  const navigate = useNavigate({ from: Route.fullPath });
  const { game: gameIdParam, tab } = Route.useSearch();
  const selectedGame = gameIdParam
    ? gamesQuery.data.find(g => g.id === gameIdParam)
    : gamesQuery.data[0];

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
              {gamesQuery.data.map(game => {
                return (
                  <Button
                    key={game.id}
                    variant={selectedGame?.id === game.id ? 'subtle' : 'ghost'}
                    onClick={() =>
                      navigate({ search: prev => ({ ...prev, game: game.id }) })
                    }
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
