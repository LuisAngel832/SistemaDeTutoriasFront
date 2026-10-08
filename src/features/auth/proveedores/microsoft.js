// Inicio de sesion con Microsoft (Microsoft Entra ID) mediante MSAL. Solo se usa para obtener el
// ID token: la sesion de la app es el JWT que entrega el backend (AUTENTICACION.md).

const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID ?? ''
const TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID ?? ''

export const microsoftConfigurado = () => Boolean(CLIENT_ID)

export const MENSAJE_SIN_CONFIGURAR =
  'El inicio de sesión con Microsoft no está configurado (falta VITE_MICROSOFT_CLIENT_ID).'

// El popup vuelve a una pagina en blanco que solo reenvia la respuesta a esta ventana
// (redirect.html). Asi la app no se carga dentro del popup.
const configuracion = () => ({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID || 'organizations'}`,
    redirectUri: `${window.location.origin}/redirect.html`,
  },
  cache: { cacheLocation: 'sessionStorage' },
})

let preparacion = null

// MSAL se descarga e inicializa al abrir el login: al hacer clic el popup se abre de inmediato
// (si se esperara una descarga, el navegador podria bloquearlo).
export const prepararMicrosoft = () => {
  if (!microsoftConfigurado()) return Promise.resolve(null)
  preparacion ??= import('@azure/msal-browser')
    .then(async ({ PublicClientApplication }) => {
      const instancia = new PublicClientApplication(configuracion())
      await instancia.initialize()
      return instancia
    })
    .catch((error) => {
      preparacion = null
      throw error
    })
  return preparacion
}

const esCancelacionDelUsuario = (error) =>
  ['user_cancelled', 'popup_window_error', 'empty_window_error'].includes(error?.errorCode)

// Devuelve el ID token, o null si el usuario cerro la ventana sin terminar.
export const obtenerIdTokenMicrosoft = async () => {
  if (!microsoftConfigurado()) throw new Error(MENSAJE_SIN_CONFIGURAR)
  const instancia = await prepararMicrosoft()
  try {
    const resultado = await instancia.loginPopup({
      scopes: ['openid', 'profile', 'email'],
      prompt: 'select_account',
    })
    return resultado.idToken
  } catch (error) {
    if (esCancelacionDelUsuario(error)) return null
    throw new Error('No se pudo iniciar sesión con Microsoft. Inténtalo de nuevo.', {
      cause: error,
    })
  }
}
