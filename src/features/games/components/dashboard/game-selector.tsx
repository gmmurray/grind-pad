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
  LuX,
} from 'react-icons/lu';

import { Link } from '@tanstack/react-router';
import { type KeyboardEventHandler, useState } from 'react';
import type { Game } from '../../game-model';
import { useAddGameFormDialog } from '../game-form-dialog';
import { useGameSelectDialog } from '../game-select-dialog';

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
  const { openAddGame, searchValue, setSearchValue, onSearchKeyDown } =
    useGameSelector();

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
                  <Menu.Item value="add" onClick={() => openAddGame({})}>
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
          mb="4"
          startElement={<LuSearch />}
          endElement={
            <IconButton
              type="button"
              size="xs"
              variant="ghost"
              colorPalette="gray"
              display={searchValue === '' ? 'none' : undefined}
              rounded="full"
              onClick={() => setSearchValue('')}
            >
              <LuX />
            </IconButton>
          }
        >
          <Input
            variant="flushed"
            placeholder="search..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
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
  const { openAddGame, searchValue, setSearchValue, onSearchKeyDown } =
    useGameSelector();

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
              onClick={() => openAddGame({})}
            >
              add game
            </Button>
            <Button type="button" variant="ghost" ml="auto" mr="-4">
              manage games
            </Button>
          </Flex>

          <InputGroup
            mb="4"
            startElement={<LuSearch />}
            endElement={
              <IconButton
                type="button"
                size="xs"
                variant="ghost"
                colorPalette="gray"
                display={searchValue === '' ? 'none' : undefined}
                rounded="full"
                onClick={() => setSearchValue('')}
              >
                <LuX />
              </IconButton>
            }
          >
            <Input
              variant="flushed"
              placeholder="search..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={onSearchKeyDown}
            />
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

const useGameSelector = () => {
  const { open: openAddGame } = useAddGameFormDialog();
  const { open: openGameSelectDialog } = useGameSelectDialog();
  const [searchValue, setSearchValue] = useState('');

  const onSearchKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key !== 'Enter' || !searchValue) {
      return;
    }

    openGameSelectDialog(searchValue);
    setSearchValue('');
  };

  return {
    openAddGame,
    openGameSelectDialog,
    searchValue,
    setSearchValue,
    onSearchKeyDown,
  };
};
