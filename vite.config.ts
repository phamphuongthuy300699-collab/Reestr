import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Важно: './' позволяет запускать сайт из любой папки (pb_public)
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});