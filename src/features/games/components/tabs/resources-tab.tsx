import SearchBar from '@/components/search-bar';
import SortMenu from '@/components/sort-menu';
import StandardPagination from '@/components/standard-pagination';
import { TagChips, TagFilter } from '@/components/tags';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip } from '@/components/ui/tooltip';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import ResourceDialog from '@/features/resources/components/resource-dialog';
import {
  type CreateResource,
  DEFAULT_RESOURCE_SEARCH_PARAMS,
  RESOURCES_SORT_BY,
  type Resource,
  type SearchResourcesParams,
} from '@/features/resources/resource-model';
import {
  searchOwnGameResourcesQueryOptions,
  useCreateOwnGameResourceMutation,
  useDeleteOwnGameResourceMutation,
  useUpdateOwnGameResourceMutation,
} from '@/features/resources/resource-queries';
import { toDate } from '@/lib/dayjs';
import { SORT_DIRECTION } from '@/lib/zod/common';
import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  IconButton,
  Menu,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { LuEllipsisVertical, LuPlus, LuSearch } from 'react-icons/lu';

type ResourcesTabProps = {
  gameId: string;
};

function ResourcesTab({ gameId }: ResourcesTabProps) {
  const [searchParams, setSearchParams] = useState<SearchResourcesParams>({
    ...DEFAULT_RESOURCE_SEARCH_PARAMS,
    gameId,
  });
  useEffect(() => {
    setSearchParams({
      ...DEFAULT_RESOURCE_SEARCH_PARAMS,
      gameId,
    });
  }, [gameId]);

  const [searchInput, setSearchInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const { data: metaData } = useSuspenseQuery(
    getOwnGameMetadataQueryOptions(gameId),
  );
  const {
    data: {
      items: resourcesData = [],
      count: resourcesCount = 0,
      totalPages: resourcesTotalPages = 0,
    } = {},
    isLoading: resourcesLoading,
  } = useQuery(searchOwnGameResourcesQueryOptions(searchParams));

  const createMutation = useCreateOwnGameResourceMutation(gameId);
  const updateMutation = useUpdateOwnGameResourceMutation(gameId);
  const deleteMutation = useDeleteOwnGameResourceMutation(gameId);

  const handleSearch = (text?: string) => {
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_RESOURCE_SEARCH_PARAMS.page,
      perPage: DEFAULT_RESOURCE_SEARCH_PARAMS.perPage,
      text,
    }));
  };

  const handleSortChange = (value: string) => {
    if (!sortOptions[value as keyof typeof sortOptions]) {
      return;
    }
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_RESOURCE_SEARCH_PARAMS.page,
      perPage: DEFAULT_RESOURCE_SEARCH_PARAMS.perPage,
      ...sortOptions[value as keyof typeof sortOptions].value,
    }));
  };

  const handleTagsChange = (value: string[]) => {
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_RESOURCE_SEARCH_PARAMS.page,
      perPage: DEFAULT_RESOURCE_SEARCH_PARAMS.perPage,
      tags: value.length ? value : undefined,
    }));
  };

  const handleRemoveTag = (tag: string) => {
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_RESOURCE_SEARCH_PARAMS.page,
      perPage: DEFAULT_RESOURCE_SEARCH_PARAMS.perPage,
      tags: (state.tags ?? []).filter(t => t !== tag),
    }));
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchParams(state => ({
      ...state,
      tags: undefined,
      text: undefined,
      ...DEFAULT_RESOURCE_SEARCH_PARAMS,
    }));
  };

  const handleNewResource = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: CreateResource) => {
    if (editingResource) {
      await updateMutation.mutateAsync({
        resourceId: editingResource.id,
        input,
      });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure?')) {
      return;
    }
    await deleteMutation.mutateAsync({
      gameId,
      resourceId,
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams(state => ({
      ...state,
      page,
    }));
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentSortValue =
    Object.entries(sortOptions).find(
      ([, v]) =>
        v.value.sortBy === searchParams.sortBy &&
        v.value.sortDir === searchParams.sortDir,
    )?.[0] ?? 'added';

  return (
    <>
      {/* TOOLBAR */}
      <Stack gap="2">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          disabled={resourcesLoading}
        />
        <Flex gap="2">
          <TagFilter
            selectedTags={searchParams.tags ?? []}
            options={metaData?.resourceTags ?? []}
            onChange={handleTagsChange}
            loading={resourcesLoading}
          />
          <Button
            type="button"
            colorPalette="gray"
            variant="subtle"
            onClick={handleReset}
            disabled={resourcesLoading}
          >
            reset
          </Button>
        </Flex>
        {(searchParams.tags?.length ?? 0) > 0 && (
          <Box my="2">
            <TagChips
              tags={searchParams.tags ?? []}
              onClose={tag => handleRemoveTag(tag)}
              disabled={resourcesLoading}
            />
          </Box>
        )}
      </Stack>
      <Flex my="2">
        <SortMenu
          value={currentSortValue}
          options={sortOptions}
          disabled={resourcesLoading}
          onChange={handleSortChange}
        />

        <Button
          size="sm"
          ml="auto"
          variant="subtle"
          onClick={handleNewResource}
        >
          <LuPlus />
          new resource
        </Button>
      </Flex>

      {/* RESOURCE EDITOR */}
      <ResourceDialog
        gameId={gameId}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        resource={editingResource}
      />

      {resourcesData.length === 0 && (
        <EmptyState
          title="no results found"
          description="try adjusting your search or adding a new resource"
          icon={<LuSearch />}
        >
          <Group>
            <Button
              size="sm"
              ml="auto"
              variant="subtle"
              onClick={handleNewResource}
            >
              <LuPlus />
              new resource
            </Button>
            <Button
              type="button"
              colorPalette="gray"
              variant="subtle"
              onClick={handleReset}
              disabled={resourcesLoading}
              size="sm"
            >
              reset
            </Button>
          </Group>
        </EmptyState>
      )}

      {/* LIST */}
      {resourcesData.length > 0 && (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={2} my="4">
            {resourcesData.map(resource => {
              return (
                <Card.Root
                  key={resource.id}
                  variant="outline"
                  _hover={{
                    borderColor: 'colorPalette.fg',
                    cursor: 'pointer',
                  }}
                  transition="border-color 0.15s ease-in-out"
                  onClick={() => handleOpenLink(resource.url)}
                >
                  <Card.Body gap="2">
                    <Tooltip content={resource.title}>
                      <Text truncate fontWeight="semibold">
                        {resource.title}
                      </Text>
                    </Tooltip>
                    <Text truncate fontSize="xs" color="fg.muted">
                      {resource.url}
                    </Text>
                    <Separator />
                    {resource.description && (
                      <Text lineClamp={2} fontSize="sm">
                        {resource.description}
                      </Text>
                    )}
                    {resource.tags.length > 0 && (
                      <Box>
                        <TagChips tags={resource.tags} />
                      </Box>
                    )}
                  </Card.Body>
                  <Card.Footer>
                    <Text color="fg.subtle" fontSize="xs">
                      {`Added ${toDate(resource.created)}`}
                    </Text>

                    <Menu.Root>
                      <Menu.Trigger asChild onClick={e => e.stopPropagation()}>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          rounded="full"
                          ml="auto"
                        >
                          <LuEllipsisVertical />
                        </IconButton>
                      </Menu.Trigger>
                      <Portal>
                        <Menu.Positioner onClick={e => e.stopPropagation()}>
                          <Menu.Content>
                            <Menu.Item
                              value="edit"
                              onClick={() => handleEditResource(resource)}
                            >
                              Edit resource
                            </Menu.Item>
                            <Menu.Item
                              value="delete"
                              color="fg.error"
                              _hover={{ bg: 'bg.error', color: 'fg.error' }}
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(resource.id)}
                            >
                              Delete resource
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Portal>
                    </Menu.Root>
                  </Card.Footer>
                </Card.Root>
              );
            })}
          </SimpleGrid>

          {/* PAGINATION */}
          <StandardPagination
            totalPages={resourcesTotalPages}
            itemCount={resourcesCount}
            pageSize={searchParams.perPage}
            currentPage={searchParams.page}
            onChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

export default ResourcesTab;

const sortOptions = {
  added: {
    label: 'recently added',
    value: { sortBy: RESOURCES_SORT_BY.CREATED, sortDir: SORT_DIRECTION.DESC },
  },
  title: {
    label: 'title',
    value: { sortBy: RESOURCES_SORT_BY.TITLE, sortDir: SORT_DIRECTION.ASC },
  },
};
