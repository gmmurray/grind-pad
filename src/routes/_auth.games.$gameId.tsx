import {
  getOwnGameQueryOptions,
  useDeleteOwnGameMutation,
} from '@/features/games/game-queries';
import {
  getOwnGameMetadataQueryOptions,
  useUpdateOwnMetadataMutation,
} from '@/features/metadata/metadata-queries';
import {
  Box,
  Breadcrumb,
  Button,
  Flex,
  Group,
  Heading,
  Icon,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { LuHouse, LuInfo } from 'react-icons/lu';

import { toaster } from '@/components/ui/toaster';
import EditGameForm from '@/features/games/components/edit-game-form';
import EditGameTags from '@/features/games/components/edit-game-tags';
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/games/$gameId')({
  component: RouteComponent,
  loader: async ({ params, context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(getOwnGameQueryOptions(params.gameId)),
      queryClient.ensureQueryData(
        getOwnGameMetadataQueryOptions(params.gameId),
      ),
    ]);
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { gameId } = Route.useParams();
  const { data: gameData } = useSuspenseQuery(getOwnGameQueryOptions(gameId));
  const { data: gameMetadata } = useSuspenseQuery(
    getOwnGameMetadataQueryOptions(gameId),
  );

  const updateMutation = useUpdateOwnMetadataMutation(gameId);
  const deleteMutation = useDeleteOwnGameMutation();

  const handleUpdateTags = async (
    type: 'notes' | 'resources',
    newValue: string[],
  ) => {
    const key = type === 'notes' ? 'noteTags' : 'resourceTags';

    await updateMutation.mutateAsync({
      gameId,
      input: {
        [key]: newValue,
      },
    });
    toaster.success({ title: 'tags updated' });
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure? This will also delete all related tasks, notes, and resources.',
      )
    ) {
      return;
    }
    await deleteMutation.mutateAsync(gameId);
    toaster.success({ title: 'game removed' });
    navigate({ to: '/games' });
  };

  return (
    <Stack flex="1" gap="4">
      <Flex>
        <Heading size="4xl">{gameData?.title}</Heading>
        <Button ml="auto" variant="subtle" asChild>
          <Link to="/home" search={{ game: gameId }}>
            open dashboard
          </Link>
        </Button>
      </Flex>

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
            <Breadcrumb.Link asChild>
              <Link to="/games">games</Link>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink>edit</Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <Stack gap="4">
        <Heading size="2xl">Details</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }}>
          <EditGameForm game={gameData!} />
        </SimpleGrid>
      </Stack>

      <Separator />

      <Stack gap="4">
        <Heading size="2xl">Settings</Heading>
        <Stack gap="2">
          <Heading size="lg">tags</Heading>
          <Group alignItems="center">
            <Icon color="fg.subtle" size="xs">
              <LuInfo />
            </Icon>
            <Text fontStyle="italic" color="fg.subtle" fontSize="sm">
              you must update the note or resource directly if you want to
              modify its tags.
            </Text>
          </Group>
          <SimpleGrid columns={{ base: 1, md: 2 }}>
            <Box>
              <Heading size="sm" mb="1">
                notes
              </Heading>
              <EditGameTags
                initialValue={gameMetadata?.noteTags ?? []}
                onSave={value => handleUpdateTags('notes', value)}
                disabled={updateMutation.isPending}
              />
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }}>
            <Box>
              <Heading size="sm" mb="1">
                resources
              </Heading>
              <EditGameTags
                initialValue={gameMetadata?.resourceTags ?? []}
                onSave={value => handleUpdateTags('resources', value)}
                disabled={updateMutation.isPending}
              />
            </Box>
          </SimpleGrid>
        </Stack>

        <Separator />

        <Box>
          <Button variant="subtle" colorPalette="red" onClick={handleDelete}>
            delete game
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
}
