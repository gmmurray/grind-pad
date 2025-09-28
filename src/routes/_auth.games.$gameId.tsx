import {
  getOwnGameQueryOptions,
  useDeleteOwnGameMutation,
} from '@/features/games/game-queries';
import {
  Box,
  Breadcrumb,
  Button,
  Flex,
  Heading,
  Separator,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';

import { TagChips } from '@/components/tags';
import EditGameForm from '@/features/games/components/edit-game-form';
import { getOwnGameMetadataQueryOptions } from '@/features/metadata/metadata-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LuHouse } from 'react-icons/lu';

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

  const deleteMutation = useDeleteOwnGameMutation();

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) {
      return;
    }
    await deleteMutation.mutateAsync(gameId);
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

        <Box>
          <Heading size="lg">note tags</Heading>
          {(gameMetadata?.noteTags ?? []).length > 0 && (
            <TagChips tags={gameMetadata?.noteTags ?? []} />
          )}
        </Box>

        <Box>
          <Heading size="lg">resource tags</Heading>
          {(gameMetadata?.resourceTags ?? []).length > 0 && (
            <TagChips tags={gameMetadata?.resourceTags ?? []} />
          )}
        </Box>

        <Box>
          <Button variant="subtle" colorPalette="red" onClick={handleDelete}>
            delete game
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
}
