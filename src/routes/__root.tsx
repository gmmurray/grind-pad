import { DEFAULT_META_DESCRIPTION, DEFAULT_META_TITLE } from '@/content';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';

import type { AuthState } from '@/features/auth/provider/auth-context';
import { TanstackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

type RouterContext = { queryClient: QueryClient; auth: AuthState };

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Scripts />
      {import.meta.env.DEV && (
        <TanstackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Tanstack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  ),
  head: () => ({
    meta: [
      {
        title: DEFAULT_META_TITLE,
      },
      {
        name: 'description',
        content: DEFAULT_META_DESCRIPTION,
      },
      {
        property: 'og:title',
        content: DEFAULT_META_TITLE,
      },
      {
        property: 'og:description',
        content: DEFAULT_META_DESCRIPTION,
      },
      {
        property: 'og:image',
        content: `${new URL('gp_opengraph.png', import.meta.env.VITE_APP_URL)}`,
      },
      {
        property: 'og:url',
        content: import.meta.env.VITE_APP_URL,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        property: 'twitter:title',
        content: DEFAULT_META_TITLE,
      },
      {
        property: 'twitter:description',
        content: DEFAULT_META_DESCRIPTION,
      },
      {
        property: 'twitter:image',
        content: `${new URL('gp_opengraph.png', import.meta.env.VITE_APP_URL)}`,
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon-32x32.png',
      },
    ],
  }),
});
