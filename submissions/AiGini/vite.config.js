import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [{
        src: 'public/manifest.json',
        dest: '.'
      },
      {
        src: 'public/background.js',
        dest: '.'
      },
      {
        src: 'public/aigini.png',
        dest: '.'
      },
    ]
    })
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
