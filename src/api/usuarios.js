import { api } from './client'
import { esquemas } from './esquemas'

export const usuariosApi = {
  // { matricula, nombre, apellidos, correo, rol, proveedor }
  actual: (opciones) => api.get('/usuarios/me', { ...opciones, esquema: esquemas.usuario }),
}
