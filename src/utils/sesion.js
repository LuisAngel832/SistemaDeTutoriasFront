// Datos de la sesion guardados en localStorage.
// Se emite un evento propio porque el evento nativo "storage" solo avisa a las
// otras pestanas, no a la que hizo el cambio.
const EVENTO_SESION = 'sesion-actualizada'

export const getSesion = () => ({
  nombre: localStorage.getItem('nombre') || '',
  matricula: localStorage.getItem('matricula') || '',
  rol: localStorage.getItem('rol') || '',
})

export const guardarNombreUsuario = (nombre) => {
  const limpio = (nombre || '').trim()
  if (!limpio || limpio === localStorage.getItem('nombre')) return
  localStorage.setItem('nombre', limpio)
  window.dispatchEvent(new Event(EVENTO_SESION))
}

export const suscribirSesion = (callback) => {
  window.addEventListener(EVENTO_SESION, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENTO_SESION, callback)
    window.removeEventListener('storage', callback)
  }
}
