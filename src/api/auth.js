import { api, TIMEOUT_DESPERTAR_MS } from './client'

// Acceso con correo o matricula y contrasena. Respuesta: { token, usuario } (o { token, rol }).
// Suelen ser la primera peticion, la que despierta al backend: por eso el timeout largo.
const opciones = { auth: false, timeout: TIMEOUT_DESPERTAR_MS }

export const authApi = {
  // credenciales: { correo, pwd } o { matricula, pwd }
  iniciarSesion: (credenciales) => api.post('/auth/signin', credenciales, opciones),

  // datos: { nombre, apellidos, matricula, correo, pwd, rol: 'TUTORADO' | 'TUTOR' }
  registrarse: (datos) => api.post('/auth/signup', datos, opciones),
}
