// theme.ts

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: 'purple',
    },
  },
});

const themeSystem = createSystem(defaultConfig, config);
export default themeSystem;
