// Roles tal como se guardan en la sesion (el backend los envia en mayusculas).
export const ROLES = {
  TUTOR: 'tutor',
  TUTORADO: 'tutorado',
  ADMIN: 'admin',
}

// Pantalla inicial de cada rol despues de iniciar sesion.
// El admin no tiene panel propio: usa el del tutor.
export const HOME_POR_ROL = {
  [ROLES.TUTOR]: '/tutor/home',
  [ROLES.ADMIN]: '/tutor/home',
  [ROLES.TUTORADO]: '/tutorado/home',
}

export const normalizarRol = (rol) => (rol ? String(rol).toLowerCase() : '')
