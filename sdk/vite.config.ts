import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'QuantumChatSDK',
      fileName: (format) => `quantum-chat-sdk.${format}.js`,
      formats: ['es', 'umd'],
    },
  },
});
