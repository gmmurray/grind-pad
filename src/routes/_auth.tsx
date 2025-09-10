import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

import AppLayout from '@/components/app-layout';
import { GameDialogProvider } from '@/features/games/components/game-dialog';

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
      <GameDialogProvider>
        <Outlet />
      </GameDialogProvider>
    </AppLayout>
  ),
});
