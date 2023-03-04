import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // set base url for production to /vue3-todo/
  base: process.env.NODE_ENV === 'production' ? '/vue3-todo/' : '/',
})
