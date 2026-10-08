import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Recursos del backend que el servidor de desarrollo reenvia (ver docs del backend, API.md).
const RECURSOS_API = [
  'auth',
  'usuarios',
  'materias',
  'catalogos',
  'tutorias',
  'horarios',
  'temas',
  'inscripciones',
  'sesiones',
  'comentarios',
  'admin',
]
const PREFIJOS_API = `^/(${RECURSOS_API.join('|')})(/|\\?|$)`

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de .env (loadEnv es necesario porque process.env no
  // incluye los archivos .env dentro de la configuracion de Vite).
  const env = loadEnv(mode, process.cwd(), '')
  const BACKEND_URL = env.VITE_BACKEND_URL || 'https://tutoriasbe.onrender.com'

  return {
    plugins: [react()],
    // '@' apunta a src/ para evitar imports relativos profundos.
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      proxy: {
        // Solo los recursos del backend: la expresion exige el segmento completo para que
        // rutas del front como /administracion no se reenvien por empezar con /admin.
        [PREFIJOS_API]: {
          target: BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
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
        exclude: ['src/test/**', 'src/app/main.jsx', 'src/**/*.test.{js,jsx}'],
        reporter: ['text-summary', 'html'],
      },
    },
  }
})
