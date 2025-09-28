import { useAppForm } from '@/components/form/use-app-form';
import { toaster } from '@/components/ui/toaster';
import { Button, Group, Stack } from '@chakra-ui/react';
import { revalidateLogic } from '@tanstack/react-form';
import { type Game, UpdateGameSchema } from '../game-model';
import { useUpdateOwnGameMutation } from '../game-queries';

type EditGameFormProps = {
  game: Game;
};

function EditGameForm({ game }: EditGameFormProps) {
  const mutation = useUpdateOwnGameMutation();

  const form = useAppForm({
    defaultValues: {
      title: game.title,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(
        { gameId: game.id, input: value },
        {
          onSuccess: () => {
            toaster.create({
              title: 'Game saved',
              type: 'success',
            });
          },
          onError: () =>
            toaster.create({
              title: 'Error',
              description: 'error saving game',
              type: 'error',
            }),
        },
      );
    },

    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: { onDynamic: UpdateGameSchema },
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
          <form.AppField name="title">
            {field => <field.FormInput label="Title" />}
          </form.AppField>
          <Group gap="4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              reset
            </Button>
            <Button type="submit">save</Button>
          </Group>
        </Stack>
      </form>
    </div>
  );
}

export default EditGameForm;
