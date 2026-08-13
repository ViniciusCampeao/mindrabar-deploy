import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      host: "0.0.0.0",
      port: 5734,
      proxy: {
        "/api": {
          target: env.VITE_BASEURL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    plugins: [
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Substituir a biblioteca qz-tray pela nossa implementação
        "qz-tray": path.resolve(__dirname, "./src/qz-tray.js")
      },
    },
  }
})
