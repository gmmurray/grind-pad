import {
  Box,
  Container,
  Flex,
  Group,
  IconButton,
  Image,
  Menu,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';

import { useAuth } from '@/features/auth/provider/use-auth';
import { Link } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import { LuUser } from 'react-icons/lu';

function AppLayout({ children }: PropsWithChildren) {
  const auth = useAuth();
  return (
    <Flex minH="100vh" direction="column">
      <Box bg="bg.panel" py="4">
        <Container maxW="5xl" display="flex">
          <Group>
            <Link to="/home">
              <Image
                src="/gp_transparent.png"
                height="50px"
                alt="GrindPad logo"
              />
            </Link>
          </Group>

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton ms="auto" rounded="full">
                <LuUser />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.ItemGroup>
                    <Menu.ItemGroupLabel color="fg.muted">
                      {auth.user?.email}
                    </Menu.ItemGroupLabel>
                    <Menu.Item value="games" asChild>
                      <Link to="/games">games</Link>
                    </Menu.Item>
                    <Menu.Item value="logout" onClick={() => auth.logout()}>
                      logout
                    </Menu.Item>
                  </Menu.ItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Container>
      </Box>

      <Container maxW="5xl" flex="1" display="flex" my="4">
        {children}
      </Container>

      <Box mt="auto" bg="bg.panel" py="4">
        <Container maxW="5xl">
          <Stack color="fg.muted" textAlign="center" fontSize="sm">
            <Text>&copy;{new Date().getFullYear()} GrindPad</Text>
            <Text> Made with coffee and too many late-night raids.</Text>
          </Stack>
        </Container>
      </Box>
    </Flex>
  );
}

export default AppLayout;
