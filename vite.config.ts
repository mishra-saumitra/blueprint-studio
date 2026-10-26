import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'demo',base:'./',publicDir:'../public',plugins:[react()],build:{outDir:'../docs',emptyOutDir:true}});
