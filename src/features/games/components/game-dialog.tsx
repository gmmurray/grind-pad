import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  useDialog,
} from '@chakra-ui/react';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';

type Mode = 'add' | 'edit';

export type GameDialogState = {
  mode: Mode;
  gameId?: string;
};

const GameDialogContext = createContext<{
  open: (state: GameDialogState) => void;
  close: () => void;
}>({ open: () => {}, close: () => {} });

export const useGameDialog = () => useContext(GameDialogContext);

export function GameDialogProvider({ children }: PropsWithChildren) {
  const dialog = useDialog();
  const [state, setState] = useState<GameDialogState | null>(null);

  const open = (s: GameDialogState) => {
    setState(s);
    dialog.setOpen(true);
  };

  const close = () => {
    dialog.setOpen(false);
    setState(null);
  };

  const isEdit = state?.mode === 'edit' && !!state.gameId;

  return (
    <GameDialogContext.Provider value={{ open, close }}>
      <Dialog.RootProvider value={dialog}>
        {children}
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{isEdit ? 'Edit' : 'Add'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>hello</Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">cancel</Button>
                </Dialog.ActionTrigger>
                <Button>{isEdit ? 'Save' : 'Add'}</Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.RootProvider>
    </GameDialogContext.Provider>
  );
}
