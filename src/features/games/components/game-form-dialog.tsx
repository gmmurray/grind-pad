import { CloseButton, Dialog, Portal, useDialog } from '@chakra-ui/react';
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';
import { AddGameForm } from './add-game-form';

export type AddGameFormDialogState = {
  submitCallback?: (gameId: string) => void;
};

const AddGameFormDialogContext = createContext<{
  open: (state: AddGameFormDialogState) => void;
  close: () => void;
}>({ open: () => {}, close: () => {} });

export const useAddGameFormDialog = () => useContext(AddGameFormDialogContext);

export function AddGameFormDialogProvider({ children }: PropsWithChildren) {
  const dialog = useDialog();
  const [state, setState] = useState<AddGameFormDialogState | null>(null);

  const open = (s: AddGameFormDialogState) => {
    setState(s);
    dialog.setOpen(true);
  };

  const close = () => {
    dialog.setOpen(false);
    setState(null);
  };

  const onSubmit = (gameId: string) => {
    if (state?.submitCallback) {
      state.submitCallback(gameId);
    }
    close();
  };

  return (
    <AddGameFormDialogContext.Provider value={{ open, close }}>
      <Dialog.RootProvider value={dialog} size={{ mdDown: 'full', md: 'lg' }}>
        {children}
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>add game</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <AddGameForm onSubmit={onSubmit} onCancel={close} />
              </Dialog.Body>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.RootProvider>
    </AddGameFormDialogContext.Provider>
  );
}
