import { AbsoluteCenter, Link as ChakraLink } from '@chakra-ui/react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
  head: () => ({
    meta: [
      {
        title: 'grind-pad',
      },
    ],
  }),
});

function App() {
  return (
    <AbsoluteCenter>
      <ChakraLink asChild>
        <Link to="/login">get started</Link>
      </ChakraLink>
    </AbsoluteCenter>
  );
}
