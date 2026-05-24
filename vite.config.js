import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8080'

const proxyTarget = {
  target: BACKEND_URL,
  changeOrigin: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': proxyTarget,
      '/materia': proxyTarget,
      '/horario': proxyTarget,
      '/tutoria': proxyTarget,
      '/tutorias': proxyTarget,
      '/temas': proxyTarget,
      '/asistencia': proxyTarget,
      '/comentarios': proxyTarget,
    },
  },
})
