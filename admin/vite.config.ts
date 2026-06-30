import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@quantum-chat/shared': resolve(__dirname, '../../backend/shared/src/index.ts'),
    },
  },
  server: { port: 5174, strictPort: true },
});
