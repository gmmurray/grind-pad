import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tsconfigPaths from "vite-tsconfig-paths"
import viteReact from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({target:'react', autoCodeSplitting: true }),
    viteReact(),
    tsconfigPaths()
  ],
})
