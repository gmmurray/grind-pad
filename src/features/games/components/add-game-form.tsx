import { Button, Field, Group, Input, Stack } from '@chakra-ui/react';
import { revalidateLogic, useForm } from '@tanstack/react-form';

import { toaster } from '@/components/ui/toaster';
import { CreateGameSchema } from '../game-model';
import { useCreateOwnGameMutation } from '../game-queries';

type AddGameFormProps = {
  onSubmit: (gameId: string) => void;
  onCancel: () => void;
};

export function AddGameForm({ onSubmit, onCancel }: AddGameFormProps) {
  const mutation = useCreateOwnGameMutation();
  const form = useForm({
    defaultValues: {
      title: '',
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(
        { ...value },
        {
          onSuccess: result => {
            onSubmit(result.id);
            toaster.create({
              title: 'Game added',
              type: 'success',
            });
          },
          onError: () => {
            toaster.create({
              title: 'Error',
              description: 'Error adding game',
              type: 'error',
            });
          },
        },
      );
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: { onDynamic: CreateGameSchema },
  });

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack gap="4" w="full">
          <form.Field name="title">
            {field => (
              <Field.Root invalid={!field.state.meta.isValid}>
                <Field.Label>title</Field.Label>
                <Input
                  placeholder="title"
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
          <Group gap="4">
            <Button type="button" variant="outline" onClick={onCancel}>
              cancel
            </Button>
            <Button type="submit">add</Button>
          </Group>
        </Stack>
      </form>
    </div>
  );
}
