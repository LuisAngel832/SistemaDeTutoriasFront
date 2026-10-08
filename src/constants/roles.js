import { ROUTES } from './routes'

// Roles tal como se guardan en la sesion (el backend los envia en mayusculas).
export const ROLES = {
  TUTOR: 'tutor',
  TUTORADO: 'tutorado',
  ADMIN: 'admin',
}

export const ROLES_TUTOR = [ROLES.TUTOR]
export const ROLES_TUTORADO = [ROLES.TUTORADO]
export const ROLES_ADMIN = [ROLES.ADMIN]

// Pantalla inicial de cada rol despues de iniciar sesion.
export const HOME_POR_ROL = {
  [ROLES.TUTOR]: ROUTES.tutor.inicio,
  [ROLES.ADMIN]: ROUTES.admin.inicio,
  [ROLES.TUTORADO]: ROUTES.tutorado.inicio,
}

export const normalizarRol = (rol) => (rol ? String(rol).toLowerCase() : '')
