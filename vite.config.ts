import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', // Use relative paths so it works inside pb_public/
    define: {
      // Polyfill process.env.API_KEY for the GenAI SDK
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevent crash if code accesses process.env directly
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});