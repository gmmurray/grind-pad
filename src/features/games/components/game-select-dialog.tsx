import SearchBar from '@/components/search-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { SORT_DIRECTION } from '@/lib/zod/common';
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Group,
  Portal,
  Stack,
  useDialog,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { LuPlus, LuSearch } from 'react-icons/lu';
import {
  DEFAULT_GAMES_SEARCH_PARAMS,
  GAMES_SORT_BY,
  type SearchGamesParams,
} from '../game-model';
import { searchOwnGamesQueryOptions } from '../game-queries';
import { useAddGameFormDialog } from './game-form-dialog';

export type GameSelectDialogValue = {
  open: (initialSearch: string) => void;
  close: () => void;
};

const GameSelectDialogContext = createContext<GameSelectDialogValue>({
  open: () => {},
  close: () => {},
});

export const useGameSelectDialog = () => useContext(GameSelectDialogContext);

const BASE_SEARCH_PARAMS = {
  ...DEFAULT_GAMES_SEARCH_PARAMS,
  sortBy: GAMES_SORT_BY.TITLE,
  sortDir: SORT_DIRECTION.ASC,
};

export function GameSelectDialogProvider({ children }: PropsWithChildren) {
  const dialog = useDialog();
  const [searchParams, setSearchParams] =
    useState<SearchGamesParams>(BASE_SEARCH_PARAMS);
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate({ from: '/home' });
  const { open: openGameFormDialog } = useAddGameFormDialog();

  const searchEnabled = dialog.open && !!searchParams.text;

  const {
    data: { items: gamesData = [] } = {},
    isLoading: gamesLoading,
  } = useQuery({
    ...searchOwnGamesQueryOptions(searchParams),
    enabled: searchEnabled,
    placeholderData: prev => prev,
  });

  const open = (initialSearch?: string) => {
    if (initialSearch) {
      setSearchParams({ ...BASE_SEARCH_PARAMS, text: initialSearch });
      setSearchValue(initialSearch);
    }
    dialog.setOpen(true);
  };

  const close = () => {
    dialog.setOpen(false);
  };

  useEffect(() => {
    if (!dialog.open) {
      handleReset();
    }
  }, [dialog.open]);

  const handleSearch = (value?: string) => {
    if (!value) {
      return;
    }
    setSearchParams({ ...BASE_SEARCH_PARAMS, text: value });
  };

  const handleReset = () => {
    setSearchValue('');
    setSearchParams(BASE_SEARCH_PARAMS);
  };

  const handleNewGame = () => {
    handleReset();
    openGameFormDialog({
      submitCallback: (gameId: string) => {
        close();
        navigate({
          search: {
            game: gameId,
          },
        });
      },
    });
  };

  const handleSelectGame = (gameId: string) => {
    close();
    handleReset();
    navigate({
      search: {
        game: gameId,
      },
    });
  };

  return (
    <GameSelectDialogContext.Provider value={{ open, close }}>
      <Dialog.RootProvider
        value={dialog}
        size={{ mdDown: 'full', md: 'lg' }}
        unmountOnExit
      >
        {children}
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content minH="50vh">
              <Dialog.Header>
                <Dialog.Title>Select a game</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="2">
                  <Group>
                    <SearchBar
                      value={searchValue}
                      onChange={setSearchValue}
                      onSearch={handleSearch}
                      disabled={gamesLoading}
                      onClear={() => setSearchValue('')}
                    />
                    <Button
                      size="sm"
                      ml="auto"
                      variant="subtle"
                      onClick={handleNewGame}
                    >
                      <LuPlus />
                      new game
                    </Button>
                  </Group>
                  {searchEnabled && gamesData.length === 0 && (
                    <EmptyState
                      title="no games found"
                      description="try adjusting your search or adding a new game"
                      icon={<LuSearch />}
                    >
                      <Button
                        type="button"
                        colorPalette="gray"
                        variant="subtle"
                        onClick={handleReset}
                        disabled={gamesLoading}
                        size="sm"
                      >
                        reset
                      </Button>
                    </EmptyState>
                  )}

                  <Box>
                    <Stack>
                      {gamesData.map(game => {
                        return (
                          <Button
                            key={game.id}
                            variant="ghost"
                            colorPalette="gray"
                            justifyContent="start"
                            onClick={() => handleSelectGame(game.id)}
                          >
                            {game.title}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>
                </Stack>
              </Dialog.Body>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.RootProvider>
    </GameSelectDialogContext.Provider>
  );
}
