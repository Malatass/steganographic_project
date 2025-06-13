import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const DEPLOY_TARGET = process.env.DEPLOY_TARGET || 'local';

let base = '/';

if (DEPLOY_TARGET === 'github') {
  base = '/steganographic_project/';
} else if (DEPLOY_TARGET === 'school') {
  base = '/~xfisa/ENC-K/';
}

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
