import {
  DEFAULT_GAMES_SEARCH_PARAMS,
  GAMES_SORT_BY,
  type SearchGamesParams,
  SearchGamesParamsSchema,
} from '@/features/games/game-model';
import {
  Box,
  Breadcrumb,
  Button,
  Flex,
  GridItem,
  Group,
  Heading,
  IconButton,
  Menu,
  Portal,
  Separator,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';

import SearchBar from '@/components/search-bar';
import SortMenu from '@/components/sort-menu';
import StandardPagination from '@/components/standard-pagination';
import { useAddGameFormDialog } from '@/features/games/components/game-form-dialog';
import {
  searchOwnGamesQueryOptions,
  useDeleteOwnGameMutation,
} from '@/features/games/game-queries';
import { toDate } from '@/lib/dayjs';
import { SORT_DIRECTION } from '@/lib/zod/common';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { LuEllipsisVertical, LuHouse } from 'react-icons/lu';
import z from 'zod';

const baseSearchParams: SearchGamesParams = {
  ...DEFAULT_GAMES_SEARCH_PARAMS,
  perPage: 10,
};

const searchSchema = z.object({
  text: SearchGamesParamsSchema.shape.text,
  page: SearchGamesParamsSchema.shape.page,
  sortBy: SearchGamesParamsSchema.shape.sortBy,
  sortDir: SearchGamesParamsSchema.shape.sortDir,
});

export const Route = createFileRoute('/_auth/games/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ searchParams: search }),
  component: RouteComponent,
  loader: async ({ context: { queryClient }, deps: { searchParams } }) => {
    await queryClient.ensureQueryData(
      searchOwnGamesQueryOptions({
        ...baseSearchParams,
        ...searchParams,
        perPage: 10,
      }),
    );
  },
  head: () => ({
    meta: [
      {
        title: 'manage games | GrindPad',
      },
    ],
  }),
});

function RouteComponent() {
  const [searchInput, setSearchInput] = useState('');
  const searchParams = Route.useSearch();

  const { open: openAddGame } = useAddGameFormDialog();
  const {
    data: {
      items: gamesData = [],
      count: gamesCount = 0,
      totalPages: gamesTotalPages = 0,
    } = {},
    isLoading: gamesLoading,
  } = useQuery(
    searchOwnGamesQueryOptions({
      ...searchParams,
      perPage: baseSearchParams.perPage,
    }),
  );

  const deleteMutation = useDeleteOwnGameMutation();
  const navigate = useNavigate({ from: '/games' });

  const handleSearch = (text?: string) => {
    navigate({
      search: prev => ({
        ...prev,
        page: baseSearchParams.page,
        text,
      }),
    });
  };

  const handleSortChange = (value: string) => {
    if (!sortOptions[value as keyof typeof sortOptions]) {
      return;
    }
    navigate({
      search: prev => ({
        ...prev,
        page: baseSearchParams.page,
        ...sortOptions[value as keyof typeof sortOptions].value,
      }),
    });
  };

  const handleReset = () => {
    setSearchInput('');
    navigate({
      search: prev => ({
        ...prev,
        text: undefined,
        ...baseSearchParams,
      }),
    });
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure?')) {
      return;
    }
    await deleteMutation.mutateAsync(gameId);
  };

  const handlePageChange = (page: number) => {
    navigate({
      search: prev => ({
        ...prev,
        page,
      }),
    });
  };

  const handleEditGameClick = (gameId: string) => {
    navigate({ to: '$gameId', params: { gameId } });
  };

  const currentSortValue =
    Object.entries(sortOptions).find(
      ([, v]) =>
        v.value.sortBy === searchParams.sortBy &&
        v.value.sortDir === searchParams.sortDir,
    )?.[0] ?? 'title';

  return (
    <Box display="flex" flex="1" flexDir="column">
      <Flex>
        <Heading size="4xl" mb="4">
          my games
        </Heading>
        <Button ms="auto" variant="outline" onClick={() => openAddGame({})}>
          add game
        </Button>
      </Flex>

      {/* BREADCRUMBS */}
      <Box my="4">
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild>
                <Link to="/home">
                  <LuHouse />
                </Link>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>games</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Box>

      {/* TOOLBAR */}
      <Group gap="2" w="full">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          disabled={gamesLoading}
          onClear={() => setSearchInput('')}
        />
        <SortMenu
          value={currentSortValue}
          options={sortOptions}
          disabled={gamesLoading}
          onChange={handleSortChange}
          size="md"
        />
        <Button
          type="button"
          colorPalette="gray"
          variant="subtle"
          onClick={handleReset}
          disabled={gamesLoading}
        >
          reset
        </Button>
      </Group>

      {/* RESULTS */}
      {gamesData.length > 0 && (
        <Fragment>
          <Box my="4">
            {gamesData.map((game, idx) => {
              return (
                <Fragment key={game.id}>
                  <Button
                    colorPalette="gray"
                    variant="ghost"
                    w="full"
                    asChild
                    alignItems="center"
                    size="lg"
                    onClick={() => handleEditGameClick(game.id)}
                  >
                    <SimpleGrid columns={5} gap="2">
                      <GridItem colSpan={2}>
                        <Text fontSize="md" truncate>
                          {game.title}
                        </Text>
                      </GridItem>
                      <GridItem colSpan={2}>
                        <Text
                          fontSize={{ base: 'xs', md: 'sm' }}
                          color="fg.subtle"
                        >{`added ${toDate(game.created)}`}</Text>
                      </GridItem>
                      <GridItem colSpan="auto" textAlign="end">
                        <Menu.Root>
                          <Menu.Trigger
                            asChild
                            onClick={e => e.stopPropagation()}
                          >
                            <IconButton
                              size="xs"
                              variant="ghost"
                              rounded="full"
                            >
                              <LuEllipsisVertical />
                            </IconButton>
                          </Menu.Trigger>
                          <Portal>
                            <Menu.Positioner onClick={e => e.stopPropagation()}>
                              <Menu.Content>
                                <Menu.Item
                                  value="edit"
                                  onClick={() => handleEditGameClick(game.id)}
                                >
                                  Edit game
                                </Menu.Item>
                                <Menu.Item
                                  value="delete"
                                  color="fg.error"
                                  _hover={{ bg: 'bg.error', color: 'fg.error' }}
                                  disabled={deleteMutation.isPending}
                                  onClick={() => handleDelete(game.id)}
                                >
                                  Delete game
                                </Menu.Item>
                              </Menu.Content>
                            </Menu.Positioner>
                          </Portal>
                        </Menu.Root>
                      </GridItem>
                    </SimpleGrid>
                  </Button>
                  {idx !== gamesData.length - 1 && <Separator my="2" />}
                </Fragment>
              );
            })}
          </Box>

          {/* PAGINATION */}
          <Box mt="auto">
            <StandardPagination
              totalPages={gamesTotalPages}
              itemCount={gamesCount}
              pageSize={baseSearchParams.perPage}
              currentPage={searchParams.page}
              onChange={handlePageChange}
            />
          </Box>
        </Fragment>
      )}
    </Box>
  );
}

const sortOptions = {
  title: {
    label: 'title',
    value: { sortBy: GAMES_SORT_BY.TITLE, sortDir: SORT_DIRECTION.ASC },
  },
  updated: {
    label: 'last updated',
    value: {
      sortBy: GAMES_SORT_BY.UPDATED,
      sortDir: SORT_DIRECTION.DESC,
    },
  },
  created: {
    label: 'recently added',
    value: {
      sortBy: GAMES_SORT_BY.CREATED,
      sortDir: SORT_DIRECTION.DESC,
    },
  },
};
