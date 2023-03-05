import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: 'Vue3 Todo',
        short_name: 'Vue3 Todo',
        description: 'A simple todo app built with Vue3',
        theme_color: '#ffffff',

      },
      workbox: {
        // generate new revision for index.html on every build
        globPatterns: ['**/*.{js,css,html}'],
        globDirectory: 'dist',
        globIgnores: ['**/node_modules/**/*'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
  // set base url for production to /vue3-todo/
  base: process.env.NODE_ENV === 'production' ? '/vue3-todo/' : '/',
})
