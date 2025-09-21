import SearchBar from '@/components/search-bar';
import SortMenu from '@/components/sort-menu';
import StandardPagination from '@/components/standard-pagination';
import { TagChips, TagFilter } from '@/components/tags';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip } from '@/components/ui/tooltip';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import NoteDialog from '@/features/notes/components/note-dialog';
import {
  type CreateNote,
  DEFAULT_NOTE_SEARCH_PARAMS,
  NOTES_SORT_BY,
  type Note,
  type SearchNotesParams,
} from '@/features/notes/note-model';

import {
  searchOwnGameNotesQueryOptions,
  useCreateOwnGameNoteMutation,
  useDeleteOwnGameNoteMutation,
  useUpdateOwnGameNoteMutation,
} from '@/features/notes/note-queries';
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
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { LuEllipsisVertical, LuPlus, LuSearch } from 'react-icons/lu';

type NotesTabProps = {
  gameId: string;
};

function NotesTab({ gameId }: NotesTabProps) {
  const [searchParams, setSearchParams] = useState<SearchNotesParams>({
    ...DEFAULT_NOTE_SEARCH_PARAMS,
    gameId,
  });

  useEffect(() => {
    setSearchParams({
      ...DEFAULT_NOTE_SEARCH_PARAMS,
      gameId,
    });
  }, [gameId]);

  const [searchInput, setSearchInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { data: metadata } = useSuspenseQuery(
    getOwnGameMetadataQueryOptions(gameId),
  );
  const {
    data: {
      items: notesData = [],
      count: notesCount = 0,
      totalPages: notesTotalPages = 0,
    } = {},
    isLoading: notesLoading,
  } = useQuery(searchOwnGameNotesQueryOptions(searchParams));

  const createMutation = useCreateOwnGameNoteMutation(gameId);
  const updateMutation = useUpdateOwnGameNoteMutation(gameId);
  const deleteMutation = useDeleteOwnGameNoteMutation(gameId);

  const handleSearch = (title?: string) => {
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_NOTE_SEARCH_PARAMS.page,
      perPage: DEFAULT_NOTE_SEARCH_PARAMS.perPage,
      title,
    }));
  };

  const handleSortChange = (value: string) => {
    if (!sortOptions[value as keyof typeof sortOptions]) {
      return;
    }
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_NOTE_SEARCH_PARAMS.page,
      perPage: DEFAULT_NOTE_SEARCH_PARAMS.perPage,
      ...sortOptions[value as keyof typeof sortOptions].value,
    }));
  };

  const handleTagsChange = (value: string[]) => {
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_NOTE_SEARCH_PARAMS.page,
      perPage: DEFAULT_NOTE_SEARCH_PARAMS.perPage,
      tags: value.length ? value : undefined,
    }));
  };

  const handleRemoveTag = (tag: string) => {
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_NOTE_SEARCH_PARAMS.page,
      perPage: DEFAULT_NOTE_SEARCH_PARAMS.perPage,
      tags: (state.tags ?? []).filter(t => t !== tag),
    }));
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchParams(state => ({
      ...state,
      tags: undefined,
      title: undefined,
      ...DEFAULT_NOTE_SEARCH_PARAMS,
    }));
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: CreateNote) => {
    if (editingNote) {
      await updateMutation.mutateAsync({
        noteId: editingNote.id,
        input,
      });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure?')) {
      return;
    }
    await deleteMutation.mutateAsync({
      gameId,
      noteId,
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams(state => ({
      ...state,
      page,
    }));
  };

  const currentSortValue =
    Object.entries(sortOptions).find(
      ([, v]) =>
        v.value.sortBy === searchParams.sortBy &&
        v.value.sortDir === searchParams.sortDir,
    )?.[0] ?? 'latest';

  return (
    <>
      {/* TOOLBAR */}
      <Stack gap="2">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          disabled={notesLoading}
        />
        <Flex gap="2">
          <TagFilter
            selectedTags={searchParams.tags ?? []}
            options={metadata?.noteTags ?? []}
            onChange={handleTagsChange}
            loading={notesLoading}
          />
          <Button
            type="button"
            colorPalette="gray"
            variant="subtle"
            onClick={handleReset}
            disabled={notesLoading}
          >
            reset
          </Button>
        </Flex>
      </Stack>
      {(searchParams.tags?.length ?? 0) > 0 && (
        <Box my="2">
          <TagChips
            tags={searchParams.tags ?? []}
            onClose={tag => handleRemoveTag(tag)}
            disabled={notesLoading}
          />
        </Box>
      )}
      <Flex my="2">
        <SortMenu
          value={currentSortValue}
          options={sortOptions}
          disabled={notesLoading}
          onChange={handleSortChange}
        />

        <Button size="sm" ml="auto" variant="subtle" onClick={handleNewNote}>
          <LuPlus />
          new note
        </Button>
      </Flex>

      {/* EDITOR */}
      <NoteDialog
        gameId={gameId}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        note={editingNote}
      />

      {notesData.length === 0 && (
        <EmptyState
          title="no results found"
          description="try adjusting your search or adding a new note"
          icon={<LuSearch />}
        >
          <Group>
            <Button
              size="sm"
              ml="auto"
              variant="subtle"
              onClick={handleNewNote}
            >
              <LuPlus />
              new note
            </Button>
            <Button
              type="button"
              colorPalette="gray"
              variant="subtle"
              onClick={handleReset}
              disabled={notesLoading}
              size="sm"
            >
              reset
            </Button>
          </Group>
        </EmptyState>
      )}

      {/* LIST */}
      {notesData.length > 0 && (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="2" my="4">
            {notesData.map(note => {
              return (
                <Card.Root
                  key={note.id}
                  variant="subtle"
                  _hover={{ opacity: 0.9, cursor: 'pointer' }}
                  onClick={() => handleEditNote(note)}
                >
                  <Card.Body gap="1">
                    <Tooltip content={note.title}>
                      <Card.Title truncate>{note.title}</Card.Title>
                    </Tooltip>
                    {note.tags.length > 0 && (
                      <Box>
                        <TagChips tags={note.tags} />
                      </Box>
                    )}
                    <Card.Description mb="4" lineClamp={4}>
                      {getPreview(note.content)}
                    </Card.Description>
                  </Card.Body>
                  <Card.Footer>
                    <Text color="fg.subtle" fontSize="xs">
                      {`Updated ${toDate(note.updated)}`}
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
                              onClick={() => handleEditNote(note)}
                            >
                              Edit note
                            </Menu.Item>
                            <Menu.Item
                              value="delete"
                              color="fg.error"
                              _hover={{ bg: 'bg.error', color: 'fg.error' }}
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(note.id)}
                            >
                              Delete note
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
            totalPages={notesTotalPages}
            itemCount={notesCount}
            pageSize={searchParams.perPage}
            currentPage={searchParams.page}
            onChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

export default NotesTab;

const sortOptions = {
  latest: {
    label: 'latest',
    value: { sortBy: NOTES_SORT_BY.UPDATED, sortDir: SORT_DIRECTION.DESC },
  },
  title: {
    label: 'title',
    value: { sortBy: NOTES_SORT_BY.TITLE, sortDir: SORT_DIRECTION.ASC },
  },
};

const getPreview = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let preview = '';
  for (const p of doc.querySelectorAll('p')) {
    if (preview.length < 150) {
      preview += ` ${p.textContent}`;
    }
  }
  preview = preview.trim();
  return preview;
};
