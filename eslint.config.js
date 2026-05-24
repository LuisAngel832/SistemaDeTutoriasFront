import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Patron comun de "cargar datos al montar" o sincronizar estado local
      // con cambios de location. Se reporta pero no bloquea el build.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // vite.config.js y otros archivos de build corren en Node, no en el browser.
    files: ['vite.config.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
