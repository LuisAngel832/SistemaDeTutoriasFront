import { api } from './client'

// Respuesta del login: { registroPendiente: false, token, usuario } o, en el primer acceso,
// { registroPendiente: true, tokenRegistro, perfil }.
export const authApi = {
  microsoft: (idToken) => api.post('/auth/microsoft', { idToken }, { auth: false }),

  google: (idToken) => api.post('/auth/google', { idToken }, { auth: false }),

  // Nombre y correo salen del tokenRegistro; el body solo trae matricula y rol.
  completarRegistro: ({ tokenRegistro, matricula, rol }) =>
    api.post('/auth/registro', { tokenRegistro, matricula, rol }, { auth: false }),
}
