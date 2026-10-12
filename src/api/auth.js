import { api } from './client'

// Acceso con correo o matricula y contrasena. Respuesta: { token, usuario } (o { token, rol }).
export const authApi = {
  // credenciales: { correo, pwd } o { matricula, pwd }
  iniciarSesion: (credenciales) => api.post('/auth/signin', credenciales, { auth: false }),

  // datos: { nombre, apellidos, matricula, correo, pwd, rol: 'TUTORADO' | 'TUTOR' }
  registrarse: (datos) => api.post('/auth/signup', datos, { auth: false }),
}
