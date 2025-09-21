import { CloseButton, Dialog, Portal, useDialog } from '@chakra-ui/react';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';
import { GameForm } from './game-form';

type Mode = 'add' | 'edit';

export type GameFormDialogState = {
  mode: Mode;
  gameId?: string;
};

const GameFormDialogContext = createContext<{
  open: (state: GameFormDialogState) => void;
  close: () => void;
}>({ open: () => {}, close: () => {} });

export const useGameFormDialog = () => useContext(GameFormDialogContext);

export function GameFormDialogProvider({ children }: PropsWithChildren) {
  const dialog = useDialog();
  const [state, setState] = useState<GameFormDialogState | null>(null);

  const open = (s: GameFormDialogState) => {
    setState(s);
    dialog.setOpen(true);
  };

  const close = () => {
    dialog.setOpen(false);
    setState(null);
  };

  const isEdit = state?.mode === 'edit' && !!state.gameId;

  return (
    <GameFormDialogContext.Provider value={{ open, close }}>
      <Dialog.RootProvider value={dialog} size={{ mdDown: 'full', md: 'lg' }}>
        {children}
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{isEdit ? 'Edit' : 'Add'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <GameForm onSubmit={close} onCancel={close} />
              </Dialog.Body>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.RootProvider>
    </GameFormDialogContext.Provider>
  );
}
