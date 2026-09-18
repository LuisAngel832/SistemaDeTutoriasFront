import { fileURLToPath, URL } from 'node:url'
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
    // '@' apunta a src/ para evitar imports relativos profundos.
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
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
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: false,
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/test/**', 'src/main.jsx', 'src/**/*.test.{js,jsx}'],
        reporter: ['text-summary', 'html'],
      },
    },
  }
})
