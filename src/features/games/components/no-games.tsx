import { AbsoluteCenter, Box, Button, Stack, Text } from '@chakra-ui/react';

import { useNavigate } from '@tanstack/react-router';
import { LuPlus } from 'react-icons/lu';
import { useAddGameFormDialog } from './game-form-dialog';

function NoGames() {
  const dialog = useAddGameFormDialog();
  const navigate = useNavigate();

  const handleAdd = () => {
    dialog.open({
      submitCallback: game => navigate({ to: '/home', search: { game } }),
    });
  };

  return (
    <AbsoluteCenter>
      <Stack gap={4}>
        <Text fontSize="large">looks like you do not have any games yet</Text>
        <Box textAlign="center">
          <Button onClick={handleAdd}>
            <LuPlus /> add your first game
          </Button>
        </Box>
      </Stack>
    </AbsoluteCenter>
  );
}

export default NoGames;
