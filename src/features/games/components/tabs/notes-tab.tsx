import { Tooltip } from '@/components/ui/tooltip';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import NoteDialog from '@/features/notes/components/note-dialog';
import { TagChips, TagFilter } from '@/features/notes/components/tags';
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
  ButtonGroup,
  Card,
  Flex,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Pagination,
  Portal,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  LuArrowUpDown,
  LuChevronLeft,
  LuChevronRight,
  LuEllipsisVertical,
  LuPlus,
  LuSearch,
} from 'react-icons/lu';

type NotesTabProps = {
  gameId: string;
};

function NotesTab({ gameId }: NotesTabProps) {
  const [searchParams, setSearchParams] = useState<SearchNotesParams>({
    ...DEFAULT_NOTE_SEARCH_PARAMS,
    gameId,
  });
  const [searchInput, setSearchInput] = useState('');

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

  const handleSearch = () => {
    const title = searchInput.trim() ? searchInput.trim() : undefined;
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_NOTE_SEARCH_PARAMS.page,
      perPage: DEFAULT_NOTE_SEARCH_PARAMS.perPage,
      title,
    }));
  };

  const handleSortChange = (value: keyof typeof sortOptions) => {
    if (!sortOptions[value]) {
      return;
    }
    setSearchParams(state => ({
      ...state,
      page: DEFAULT_NOTE_SEARCH_PARAMS.page,
      perPage: DEFAULT_NOTE_SEARCH_PARAMS.perPage,
      ...sortOptions[value].value,
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const createMutation = useCreateOwnGameNoteMutation(gameId);
  const updateMutation = useUpdateOwnGameNoteMutation(gameId);
  const deleteMutation = useDeleteOwnGameNoteMutation(gameId);

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
      <SimpleGrid gap="2" columns={{ base: 1, md: 1 }}>
        <InputGroup
          endElement={
            <IconButton
              type="button"
              size="xs"
              variant="ghost"
              colorPalette="gray"
              rounded="full"
              onClick={handleSearch}
              disabled={notesLoading}
            >
              <LuSearch />
            </IconButton>
          }
        >
          <Input
            placeholder="Search notes..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            disabled={notesLoading}
          />
        </InputGroup>
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
            onClick={handleReset}
            disabled={notesLoading}
          >
            reset
          </Button>
        </Flex>
      </SimpleGrid>
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
        <Menu.Root>
          <Menu.Trigger asChild disabled={notesLoading}>
            <Button size="sm" variant="subtle">
              <LuArrowUpDown /> Sort
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="10rem">
                <Menu.RadioItemGroup
                  value={currentSortValue}
                  onValueChange={e =>
                    handleSortChange(e.value as keyof typeof sortOptions)
                  }
                >
                  {Object.entries(sortOptions).map(([key, def]) => (
                    <Menu.RadioItem key={key} value={key}>
                      {def.label}
                      <Menu.ItemIndicator />
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioItemGroup>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <Button size="sm" ml="auto" variant="subtle" onClick={handleNewNote}>
          <LuPlus />
          new note
        </Button>
      </Flex>

      {/* NOTE EDITOR */}
      <NoteDialog
        gameId={gameId}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        note={editingNote}
      />

      {notesData.length > 0 && (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="2" my="4">
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
                      <Card.Title lineClamp={1}>{note.title}</Card.Title>
                    </Tooltip>
                    {note.tags.length > 0 && (
                      <Box>
                        <TagChips tags={note.tags} />
                      </Box>
                    )}
                    <Card.Description mb="4">
                      {getPreview(note.content)}
                    </Card.Description>
                  </Card.Body>
                  <Card.Footer>
                    <Text color="fg.muted" fontSize="xs">
                      {toDate(note.updated)}
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

          {notesTotalPages > 1 && (
            <Flex justifyContent="center">
              <Pagination.Root
                count={notesCount}
                pageSize={searchParams.perPage}
                page={searchParams.page}
                onPageChange={e => handlePageChange(e.page)}
              >
                <ButtonGroup variant="ghost" size="sm">
                  <Pagination.PrevTrigger asChild>
                    <IconButton>
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={page => (
                      <IconButton
                        variant={{ base: 'ghost', _selected: 'outline' }}
                      >
                        {page.value}
                      </IconButton>
                    )}
                  />

                  <Pagination.NextTrigger asChild>
                    <IconButton>
                      <LuChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Flex>
          )}
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
  const firstP =
    doc.querySelector('p')?.textContent || doc.body.textContent || '';
  return firstP.length > 150 ? `${firstP.substring(0, 150)}...` : firstP;
};
