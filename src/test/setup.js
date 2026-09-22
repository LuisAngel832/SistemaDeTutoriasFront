import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Las pruebas de fechas asumen la zona horaria de los usuarios (sin horario de verano).
process.env.TZ = 'America/Mexico_City'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom no implementa <dialog>: se simula lo necesario para probar Modal.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
