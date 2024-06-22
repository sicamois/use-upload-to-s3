import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import preserveDirectives from 'rollup-plugin-preserve-directives';

const ReactCompilerConfig = {
  /* ... */
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    dts({ include: ['src'] }),
    preserveDirectives(),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/mod.ts'),
      formats: ['es'],
      name: 'useUploadToS3',
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        '@aws-sdk/client-s3',
        '@aws-sdk/s3-request-presigner',
      ],
      output: {
        preserveModules: true,
        entryFileNames: '[name].js',
      },
    },
  },
});
