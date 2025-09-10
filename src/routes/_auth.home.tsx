import {
  Box,
  Card,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Menu,
  Portal,
} from '@chakra-ui/react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { LuEllipsisVertical, LuList, LuPlus } from 'react-icons/lu';

import { useGameDialog } from '@/features/games/components/game-dialog';

export const Route = createFileRoute('/_auth/home')({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    console.log(queryClient);
  },
});

function RouteComponent() {
  const { open } = useGameDialog();
  return (
    <Grid
      flex="1"
      templateColumns={{ base: 'none', md: 'repeat(4, 1fr)' }}
      display={{ base: 'flex', md: 'grid' }}
      flexDir={{ base: 'column', md: 'unset' }}
      gap="4"
    >
      <GridItem colSpan={{ base: 1, md: 1 }}>
        <Card.Root h="full">
          <Card.Body>
            <Flex alignItems="center">
              <Card.Title>my games</Card.Title>
              <Menu.Root positioning={{ placement: 'bottom-end' }}>
                <Menu.Trigger asChild>
                  <IconButton
                    ml="auto"
                    variant="ghost"
                    colorPalette="gray"
                    size="sm"
                    rounded="full"
                  >
                    <LuEllipsisVertical />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        value="add"
                        onClick={() => open({ mode: 'add' })}
                      >
                        <LuPlus />
                        <Box>add</Box>
                      </Menu.Item>
                      <Menu.Item value="manage">
                        <LuList />
                        <Link to="/games">manage</Link>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Flex>
          </Card.Body>
        </Card.Root>
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 3 }} flex={{ base: '1', md: 'unset' }}>
        <Card.Root h="full">
          <Card.Body>hi</Card.Body>
        </Card.Root>
      </GridItem>
    </Grid>
  );
}
