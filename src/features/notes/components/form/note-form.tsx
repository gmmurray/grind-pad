import { toaster } from '@/components/ui/toaster';
import { Button, Field, Group, Input, Stack } from '@chakra-ui/react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useCurrentEditor } from '@tiptap/react';
import { useState } from 'react';
import {
  type CreateNote,
  CreateNoteSchema,
  type Note,
  type UpdateNote,
  UpdateNoteSchema,
} from '../../note-model';
import NoteContentEditor from './note-content-editor';

type NoteFormProps = {
  note?: Note | null;
  onSubmit: (input: CreateNote | UpdateNote) => Promise<void>;
  onCancel: () => void;
};

function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
  const { editor: contentEditor } = useCurrentEditor();
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);

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

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Stack gap="4">
        {/* Title Field */}
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

        {/* Content Editor */}
        <Field.Root>
          <Field.Label>Content</Field.Label>
          <NoteContentEditor />
        </Field.Root>

        {/* Tags Field - Simple for now */}
        <Field.Root>
          <Field.Label>Tags</Field.Label>
          <Input
            placeholder="Add a tag and press Enter..."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                addTag(target.value.trim());
                target.value = '';
              }
            }}
          />
          {selectedTags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '8px',
              }}
            >
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: '#805ad5',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field.Root>

        {/* Form Actions */}
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
