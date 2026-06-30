import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  const isServe = command === 'serve';

  return {
    plugins: [react(), !isServe && dts({ insertTypesEntry: true })].filter(Boolean),
    resolve: {
      alias: {
        '@quantum-chat/shared': resolve(__dirname, '../../backend/shared/src/index.ts'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      open: '/',
    },
    ...(isServe
      ? {}
      : {
          build: {
            lib: {
              entry: resolve(__dirname, 'src/index.ts'),
              name: 'QuantumChat',
              fileName: 'quantum-chat-widget',
              formats: ['es', 'umd'],
            },
            rollupOptions: {
              external: ['react', 'react-dom'],
              output: {
                globals: {
                  react: 'React',
                  'react-dom': 'ReactDOM',
                },
              },
            },
          },
          define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
          },
        }),
  };
});
