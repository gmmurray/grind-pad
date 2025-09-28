import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

import AppLayout from '@/components/app-layout';
import NotFound from '@/components/not-found';
import { AddGameFormDialogProvider } from '@/features/games/components/game-form-dialog';
import { GameSelectDialogProvider } from '@/features/games/components/game-select-dialog';
import type { PropsWithChildren } from 'react';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => (
    <Wrappers>
      <Outlet />
    </Wrappers>
  ),
  notFoundComponent: () => (
    <Wrappers>
      <NotFound />
    </Wrappers>
  ),
});

const Wrappers = ({ children }: PropsWithChildren) => (
  <AppLayout>
    <AddGameFormDialogProvider>
      <GameSelectDialogProvider>{children}</GameSelectDialogProvider>
    </AddGameFormDialogProvider>
  </AppLayout>
);
