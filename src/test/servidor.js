import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

// Servidor MSW compartido: cada prueba registra sus handlers con servidor.use(...).
export const servidor = setupServer()

export const usarServidorMock = () => {
  beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => servidor.resetHandlers())
  afterAll(() => servidor.close())
}

// Respuesta con el formato del backend: { success, message, data }
export const respuestaOk = (data = null, message = 'OK') => ({ success: true, message, data })
export const respuestaError = (message, data = null) => ({ success: false, message, data })
