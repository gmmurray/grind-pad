import { Outlet, createFileRoute } from '@tanstack/react-router';

import { Card } from '@chakra-ui/react';

export const Route = createFileRoute('/_auth/games')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card.Root flex="1">
      <Card.Body>
        <Outlet />
      </Card.Body>
    </Card.Root>
  );
}
