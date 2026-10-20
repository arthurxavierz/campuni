import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O Supabase só é baixado quando há banco configurado (import dinâmico em
// lib/dados.ts). Na demonstração o visitante não paga por ele.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
