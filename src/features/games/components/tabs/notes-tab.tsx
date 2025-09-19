import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import NoteDialog from '@/features/notes/components/note-dialog';
import { TagFilter } from '@/features/notes/components/tags';
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
  useUpdateOwnGameNoteMutation,
} from '@/features/notes/note-queries';
import { SORT_DIRECTION } from '@/lib/zod/common';
import {
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Portal,
  SimpleGrid,
  Tag,
  Wrap,
} from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LuArrowUpDown, LuPlus, LuSearch } from 'react-icons/lu';

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
  const { data: notesData, isLoading: notesLoading } = useQuery(
    searchOwnGameNotesQueryOptions(searchParams),
  );

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
      ...DEFAULT_NOTE_SEARCH_PARAMS,
    }));
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const createMutation = useCreateOwnGameNoteMutation(gameId);
  const updateMutation = useUpdateOwnGameNoteMutation(gameId);

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
        <Wrap my="2">
          {searchParams.tags?.map(tag => (
            <Tag.Root key={tag} p="1">
              <Tag.Label>{tag}</Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger
                  onClick={() => handleRemoveTag(tag)}
                  disabled={notesLoading}
                />
              </Tag.EndElement>
            </Tag.Root>
          ))}
        </Wrap>
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
