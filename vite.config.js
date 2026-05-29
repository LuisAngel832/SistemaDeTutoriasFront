import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de .env (loadEnv es necesario porque process.env no
  // incluye los archivos .env dentro de la configuracion de Vite).
  const env = loadEnv(mode, process.cwd(), '')
  const BACKEND_URL = env.VITE_BACKEND_URL || 'http://localhost:8080'

  const proxyTarget = {
    target: BACKEND_URL,
    changeOrigin: true,
    secure: false,
  }

  return {
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
  }
})
