import { AbsoluteCenter, Link as ChakraLink } from '@chakra-ui/react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
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
