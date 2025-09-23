import { Box, Breadcrumb, Heading } from '@chakra-ui/react';
import { Link, createFileRoute } from '@tanstack/react-router';

import { LuHouse } from 'react-icons/lu';

export const Route = createFileRoute('/_auth/games/$gameId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { gameId } = Route.useParams();
  return (
    <Box>
      <Heading size="4xl" mb="4" display={{ base: 'none', md: 'initial' }}>
        my games
      </Heading>
      <Box my="4">
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
              <Breadcrumb.CurrentLink>{gameId}</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Box>
    </Box>
  );
}
