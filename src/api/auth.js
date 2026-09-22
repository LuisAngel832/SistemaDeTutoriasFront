import { api } from './client'

export const authApi = {
  // Devuelve { token, rol }.
  iniciarSesion: ({ matricula, pwd }) =>
    api.post('/auth/signin', { matricula, pwd }, { auth: false }),

  registrarse: (usuario) => api.post('/auth/signup', usuario, { auth: false }),
}
