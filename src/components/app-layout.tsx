import {
  Box,
  Center,
  Container,
  Flex,
  IconButton,
  Menu,
  Portal,
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
          <Link to="/home">
            <Text textStyle="3xl" fontWeight="medium">
              GrindPad
            </Text>
          </Link>

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
          <Center>
            <Text color="fg.muted">©{new Date().getFullYear()} GrindApp</Text>
          </Center>
        </Container>
      </Box>
    </Flex>
  );
}

export default AppLayout;
