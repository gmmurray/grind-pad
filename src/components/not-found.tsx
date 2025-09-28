import {
  AbsoluteCenter,
  Box,
  Button,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';

import { Link } from '@tanstack/react-router';

type NotFoundProps = {
  title?: string;
  description?: string;
  redirect?: {
    text: string;
    to: string;
  };
};

function NotFound({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  redirect = {
    to: '/home',
    text: 'Go home',
  },
}: NotFoundProps) {
  return (
    <AbsoluteCenter>
      <Stack gap="2">
        <Heading size="xl">{title}</Heading>
        <Text>{description}</Text>
        <Box>
          <Button size="sm" variant="subtle" asChild>
            <Link to={redirect.to}>{redirect.text}</Link>
          </Button>
        </Box>
      </Stack>
    </AbsoluteCenter>
  );
}

export default NotFound;

const DEFAULT_TITLE = 'Not Found';
const DEFAULT_DESCRIPTION = 'The page you requested could not be found.';
