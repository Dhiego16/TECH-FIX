import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base './' faz o build funcionar em qualquer subcaminho
// (GitHub Pages: usuario.github.io/TECH-FIX/, Vercel, etc.)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
