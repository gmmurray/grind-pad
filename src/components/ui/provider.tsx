'use client';

import themeSystem from '@/lib/theme';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function UIProvider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={themeSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
