import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Fork de eslint-plugin-jsx-a11y compatible con ESLint 10.
      jsxA11y.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Los datos del servidor se cargan con TanStack Query, no con efectos.
      'react-hooks/set-state-in-effect': 'error',
    },
  },
  {
    // vite.config.js y otros archivos de build corren en Node, no en el browser.
    files: ['vite.config.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Las pruebas corren en Node (Vitest) con un DOM simulado.
    files: ['src/test/**', '**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // Siempre al final: desactiva las reglas de estilo que resuelve Prettier.
  prettier,
])
