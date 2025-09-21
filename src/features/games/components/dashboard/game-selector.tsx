import {
  Box,
  Button,
  Collapsible,
  Flex,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Portal,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  LuChevronDown,
  LuEllipsisVertical,
  LuList,
  LuPlus,
  LuSearch,
} from 'react-icons/lu';

import { Link } from '@tanstack/react-router';
import type { Game } from '../../game-model';
import { useGameFormDialog } from '../game-form-dialog';

type GameSelectorProps = {
  games: Game[];
  selectedGame: Game;
  onSelectGame: (id: string) => void;
};

export function DesktopGameSelector({
  games,
  selectedGame,
  onSelectGame,
}: GameSelectorProps) {
  const { open: openNewGameDialog } = useGameFormDialog();

  return (
    <Box display={{ base: 'none', md: 'initial' }}>
      <Flex alignItems="center" mb="4">
        <Text
          fontSize="lg"
          color="fg.muted"
          display={{ base: 'none', md: 'initial' }}
        >
          games
        </Text>
        <Box ml="auto">
          <Menu.Root positioning={{ placement: 'bottom-end' }}>
            <Menu.Trigger asChild>
              <IconButton
                variant="ghost"
                colorPalette="gray"
                size="sm"
                rounded="full"
              >
                <LuEllipsisVertical />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner display={{ base: 'none', md: 'initial' }}>
                <Menu.Content>
                  <Menu.Item
                    value="add"
                    onClick={() => openNewGameDialog({ mode: 'add' })}
                  >
                    <LuPlus />
                    <Box>add</Box>
                  </Menu.Item>
                  <Menu.Item value="manage" asChild>
                    <Link to="/games">
                      <LuList />
                      manage
                    </Link>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Box>
      </Flex>

      <Stack gap="1">
        <InputGroup
          endElement={
            <IconButton
              type="button"
              size="xs"
              variant="ghost"
              colorPalette="gray"
              rounded="full"
            >
              <LuSearch />
            </IconButton>
          }
        >
          <Input variant="flushed" placeholder="search..." />
        </InputGroup>
        {games.map(game => {
          return (
            <Button
              key={game.id}
              colorPalette="gray"
              variant={selectedGame.id === game.id ? 'subtle' : 'ghost'}
              onClick={() => onSelectGame(game.id)}
              justifyContent="start"
            >
              {game.title}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}

export function MobileGameSelector({
  games,
  selectedGame,
  onSelectGame,
}: GameSelectorProps) {
  const { open: openNewGameDialog } = useGameFormDialog();

  return (
    <Box display={{ base: 'initial', md: 'none' }}>
      <Collapsible.Root>
        <Collapsible.Trigger w="full">
          <Flex alignItems="center">
            <Text
              fontSize="lg"
              color="fg.muted"
              display={{ base: 'initial', md: 'none' }}
            >
              {selectedGame.title}
            </Text>
            <Box ml="auto">{<LuChevronDown />}</Box>
          </Flex>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <Separator mt="2" />
          <Flex>
            <Button
              type="button"
              variant="ghost"
              ml="-4"
              onClick={() => openNewGameDialog({ mode: 'add' })}
            >
              add game
            </Button>
            <Button type="button" variant="ghost" ml="auto" mr="-4">
              manage games
            </Button>
          </Flex>

          <InputGroup
            mb="4"
            endElement={
              <IconButton
                type="button"
                size="xs"
                variant="ghost"
                colorPalette="gray"
                rounded="full"
              >
                <LuSearch />
              </IconButton>
            }
          >
            <Input variant="flushed" placeholder="search..." />
          </InputGroup>

          <Stack gap="1">
            {games.map(game => {
              return (
                <Button
                  key={game.id}
                  colorPalette="gray"
                  variant={selectedGame?.id === game.id ? 'subtle' : 'ghost'}
                  onClick={() => onSelectGame(game.id)}
                  justifyContent="start"
                >
                  {game.title}
                </Button>
              );
            })}
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}
