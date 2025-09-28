import {
  AbsoluteCenter,
  Button,
  Group,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link, useRouter } from '@tanstack/react-router';

type ErrorViewProps = {
  loader?: boolean;
  onReload?: () => void;
};

function ErrorView({ loader = false, onReload }: ErrorViewProps) {
  const router = useRouter();
  const handleReload = () => {
    if (onReload) {
      return onReload();
    }

    if (loader) {
      return router.invalidate();
    }
    window.location.reload();
  };
  return (
    <AbsoluteCenter>
      <Stack gap="2">
        <Heading size="xl">Unexpected Error</Heading>
        <Text>An unexpected error has occurred.</Text>
        <Group gap="2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/home">Go home</Link>
          </Button>
          <Button size="sm" variant="subtle" onClick={handleReload}>
            Reload
          </Button>
        </Group>
      </Stack>
    </AbsoluteCenter>
  );
}

export default ErrorView;
