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

// Las mismas cabeceras que `headers` de render.yaml; mantenerlas iguales. Solo se aplican en
// `vite preview` (el servidor de desarrollo usa scripts inline para HMR).
const CABECERAS_SEGURIDAD = {
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self' https://tutoriasbe.onrender.com https://*.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
}

// Precarga la fuente del texto (subconjunto latino, ver src/styles/fuente.css) para que no se
// pinte primero con la del sistema y luego cambie. El nombre lleva el hash del build.
const precargarFuente = () => ({
  name: 'precargar-fuente',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (_html, { bundle }) => {
      const fuente = Object.keys(bundle ?? {}).find((archivo) =>
        /montserrat-latin-wght-normal.*\.woff2$/.test(archivo),
      )
      if (!fuente) return []
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: `/${fuente}`,
            as: 'font',
            type: 'font/woff2',
            crossorigin: '',
          },
          injectTo: 'head',
        },
      ]
    },
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de .env (loadEnv es necesario porque process.env no
  // incluye los archivos .env dentro de la configuracion de Vite).
  const env = loadEnv(mode, process.cwd(), '')
  const BACKEND_URL = env.VITE_BACKEND_URL || 'https://tutoriasbe.onrender.com'

  // Version que se reporta a Sentry: el SHA del commit que Render construye (RENDER_GIT_COMMIT),
  // o VITE_RELEASE si se define a mano.
  const RELEASE = env.VITE_RELEASE || env.RENDER_GIT_COMMIT || ''

  const plugins = [react(), precargarFuente()]

  return {
    plugins,
    define: {
      'import.meta.env.VITE_RELEASE': JSON.stringify(RELEASE),
    },
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
    preview: {
      headers: CABECERAS_SEGURIDAD,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: false,
      restoreMocks: true,
      // Las pruebas de pantallas completas (router, formularios) son lentas en paralelo.
      testTimeout: 20_000,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/test/**', 'src/app/main.jsx', 'src/**/*.test.{js,jsx}'],
        reporter: ['text-summary', 'html'],
      },
    },
  }
})
