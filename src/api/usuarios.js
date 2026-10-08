import { api } from './client'

export const usuariosApi = {
  // { matricula, nombre, apellidos, correo, rol, proveedor }
  actual: (opciones) => api.get('/usuarios/me', opciones),
}
