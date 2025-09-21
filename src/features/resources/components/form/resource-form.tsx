import { useAppForm } from '@/components/form/use-app-form';
import { TagChips, TagInput } from '@/components/tags';
import { toaster } from '@/components/ui/toaster';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import { alphabeticalDedupe } from '@/utils/dedupe';
import { Box, Button, Field, Group, Stack } from '@chakra-ui/react';
import { revalidateLogic } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  type CreateResource,
  CreateResourceSchema,
  type Resource,
  type UpdateResource,
  UpdateResourceSchema,
} from '../../resource-model';

type ResourceFormProps = {
  gameId: string;
  resource: Resource | null;
  onSubmit: (input: CreateResource | UpdateResource) => Promise<void>;
  onCancel: () => void;
};

function ResourceForm({
  gameId,
  resource,
  onSubmit,
  onCancel,
}: ResourceFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    resource?.tags ?? [],
  );

  const { data: metadata } = useSuspenseQuery(
    getOwnGameMetadataQueryOptions(gameId),
  );

  const initialTags = useMemo(
    () =>
      alphabeticalDedupe([
        ...(metadata?.resourceTags ?? []),
        ...(resource?.tags ?? []),
      ]),
    [metadata?.resourceTags, resource?.tags],
  );

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(state => state.filter(t => t !== tag));
  };

  const isEdit = !!resource;

  const form = useAppForm({
    defaultValues: {
      title: resource?.title ?? '',
      url: resource?.url ?? '',
      description: resource?.description ?? '',
      tags: resource?.tags ?? [],
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit({
          ...value,
          tags: selectedTags,
        });

        toaster.create({
          title: isEdit ? 'Resource updated' : 'Resource created',
          type: 'success',
        });
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: isEdit
            ? 'Error updating resource'
            : 'Error creating resource',
          type: 'error',
        });
      }
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onDynamic: isEdit ? UpdateResourceSchema : CreateResourceSchema,
    },
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
        <form.AppField name="title">
          {field => (
            <field.FormInput
              label="Title"
              placeholder="Enter resource title..."
            />
          )}
        </form.AppField>

        <form.AppField name="url">
          {field => (
            <field.FormInput label="URL" placeholder="https://example.com" />
          )}
        </form.AppField>

        <form.AppField name="description">
          {field => (
            <field.FormInput
              label="Description"
              placeholder="Enter resource description..."
            />
          )}
        </form.AppField>

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

export default ResourceForm;
