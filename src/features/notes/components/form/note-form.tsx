import { toaster } from '@/components/ui/toaster';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import { alphabeticalDedupe } from '@/utils/dedupe';
import { Box, Button, Field, Group, Input, Stack } from '@chakra-ui/react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useCurrentEditor } from '@tiptap/react';
import { useMemo, useState } from 'react';
import {
  type CreateNote,
  CreateNoteSchema,
  type Note,
  type UpdateNote,
  UpdateNoteSchema,
} from '../../note-model';
import { TagChips, TagInput } from '../tags';
import NoteContentEditor from './note-content-editor';

type NoteFormProps = {
  gameId: string;
  note?: Note | null;
  onSubmit: (input: CreateNote | UpdateNote) => Promise<void>;
  onCancel: () => void;
};

function NoteForm({ gameId, note, onSubmit, onCancel }: NoteFormProps) {
  const { editor: contentEditor } = useCurrentEditor();
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);

  const { data: metadata } = useSuspenseQuery(
    getOwnGameMetadataQueryOptions(gameId),
  );

  const initialTags = useMemo(
    () =>
      alphabeticalDedupe([
        ...(metadata?.noteTags ?? []),
        ...(note?.tags ?? []),
      ]),
    [metadata?.noteTags, note?.tags],
  );

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(state => state.filter(t => t !== tag));
  };

  const isEdit = !!note;

  const form = useForm({
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      tags: note?.tags || [],
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit({
          title: value.title,
          content: contentEditor?.getHTML() ?? '',
          tags: selectedTags,
        });

        toaster.create({
          title: isEdit ? 'Note updated' : 'Note created',
          type: 'success',
        });
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: isEdit ? 'Error updating note' : 'Error creating note',
          type: 'error',
        });
      }
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: { onDynamic: isEdit ? UpdateNoteSchema : CreateNoteSchema },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Stack gap="2">
        <form.Field name="title">
          {field => (
            <Field.Root invalid={!field.state.meta.isValid}>
              <Field.Label>Title</Field.Label>
              <Input
                placeholder="Enter note title..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
              />
              <Field.ErrorText>
                {field.state.meta.errors.map(e => e?.message).join(',')}
              </Field.ErrorText>
            </Field.Root>
          )}
        </form.Field>

        <Field.Root>
          <Field.Label>Content</Field.Label>
          <NoteContentEditor />
        </Field.Root>

        <Field.Root>
          <Field.Label>Tags</Field.Label>
          <TagInput
            initialTags={initialTags}
            selectedTags={selectedTags}
            onChange={value => setSelectedTags(value)}
          />
        </Field.Root>

        {(selectedTags.length ?? 0) > 0 && (
          <Box my="2">
            <TagChips
              tags={selectedTags}
              onClose={tag => handleRemoveTag(tag)}
            />
          </Box>
        )}

        <Group gap="4" justifyContent="flex-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
        </Group>
      </Stack>
    </form>
  );
}

export default NoteForm;
