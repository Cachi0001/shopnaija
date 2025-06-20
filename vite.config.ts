import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    headers: {
      'Content-Type': 'application/javascript',
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Force correct path to @supabase/postgrest-js ES Module
      '@supabase/postgrest-js': path.resolve(__dirname, 'node_modules/@supabase/postgrest-js/dist/module/index.js'),
    },
  },
  optimizeDeps: {
    exclude: ['@supabase/supabase-js', '@supabase/postgrest-js'],
    esbuildOptions: {
      mainFields: ['module', 'main'],
      target: 'esnext',
    },
  },
}));