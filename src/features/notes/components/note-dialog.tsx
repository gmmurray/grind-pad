import { CloseButton, Dialog, Portal, useDialog } from '@chakra-ui/react';
import type { CreateNote, Note, UpdateNote } from '../note-model';

import NoteContentEditorProvider from './form/note-content-editor-provider';
import NoteForm from './form/note-form';

type NoteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateNote | UpdateNote) => Promise<void>;
  note?: Note | null; // null for add mode, Note for edit mode
};

function NoteDialog({ isOpen, onClose, onSubmit, note }: NoteDialogProps) {
  const dialog = useDialog({
    open: isOpen,
    onOpenChange: ({ open }) => !open && onClose(),
  });

  const isEdit = !!note;

  const handleSubmit = async (input: CreateNote | UpdateNote) => {
    await onSubmit(input);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog.RootProvider value={dialog} size={{ mdDown: 'full', md: 'lg' }}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="2xl" w="full">
            <Dialog.Header>
              <Dialog.Title>{isEdit ? 'Edit Note' : 'New Note'}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <NoteContentEditorProvider note={note}>
                <NoteForm
                  note={note}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </NoteContentEditorProvider>
            </Dialog.Body>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}

export default NoteDialog;
