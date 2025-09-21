import { CloseButton, Dialog, Portal, useDialog } from '@chakra-ui/react';
import type {
  CreateResource,
  Resource,
  UpdateResource,
} from '../resource-model';

import ResourceForm from './form/resource-form';

type ResourceDialogProps = {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateResource | UpdateResource) => Promise<void>;
  resource: Resource | null; // null for add mode, Resource for edit mode
};

function ResourceDialog({
  gameId,
  isOpen,
  onClose,
  onSubmit,
  resource,
}: ResourceDialogProps) {
  const dialog = useDialog({
    open: isOpen,
    onOpenChange: ({ open }) => !open && onClose(),
  });

  const isEdit = !!resource;

  const handleSubmit = async (input: CreateResource | UpdateResource) => {
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
              <Dialog.Title>
                {isEdit ? 'Edit Resource' : 'New Resource'}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <ResourceForm
                gameId={gameId}
                resource={resource}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
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

export default ResourceDialog;
