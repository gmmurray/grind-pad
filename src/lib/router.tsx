import ErrorView from '@/components/error-view';
import NotFound from '@/components/not-found';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../routeTree.gen';
import { queryClient } from './queryClient';

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <NotFound />,
  defaultErrorComponent: ErrorView,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
