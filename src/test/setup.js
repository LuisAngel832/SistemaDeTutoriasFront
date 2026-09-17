import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Las pruebas de fechas asumen la zona horaria de los usuarios (sin horario de verano).
process.env.TZ = 'America/Mexico_City'

afterEach(() => {
  cleanup()
  localStorage.clear()
})
