import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Sito-ius/',
  build: { outDir: 'docs' },
  plugins: [react()],
});
