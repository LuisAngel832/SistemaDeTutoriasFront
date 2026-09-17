import { ROUTES } from './routes'

// Roles tal como se guardan en la sesion (el backend los envia en mayusculas).
export const ROLES = {
  TUTOR: 'tutor',
  TUTORADO: 'tutorado',
  ADMIN: 'admin',
}

// El admin no tiene panel propio: usa las pantallas del tutor.
export const ROLES_TUTOR = [ROLES.TUTOR, ROLES.ADMIN]
export const ROLES_TUTORADO = [ROLES.TUTORADO]

// Pantalla inicial de cada rol despues de iniciar sesion.
export const HOME_POR_ROL = {
  [ROLES.TUTOR]: ROUTES.tutor.inicio,
  [ROLES.ADMIN]: ROUTES.tutor.inicio,
  [ROLES.TUTORADO]: ROUTES.tutorado.inicio,
}

export const normalizarRol = (rol) => (rol ? String(rol).toLowerCase() : '')
