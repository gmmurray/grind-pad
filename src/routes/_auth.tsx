import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

import AppLayout from '@/components/app-layout';
import { AddGameFormDialogProvider } from '@/features/games/components/game-form-dialog';
import { GameSelectDialogProvider } from '@/features/games/components/game-select-dialog';

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
    <AppLayout>
      <AddGameFormDialogProvider>
        <GameSelectDialogProvider>
          <Outlet />
        </GameSelectDialogProvider>
      </AddGameFormDialogProvider>
    </AppLayout>
  ),
});
