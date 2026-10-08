import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useLayoutEffect, useRef, useState } from 'react'
import { clases } from '@/utils/clases'
import styles from './BotonProveedor.module.css'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

const MENSAJE_SIN_CONFIGURAR =
  'El inicio de sesión con Google no está configurado (falta VITE_GOOGLE_CLIENT_ID).'

// Google Identity Services solo entrega el ID token desde su propio boton, asi que se usa el
// boton oficial con el texto y el tema mas cercanos al mockup. El ancho admite de 200 a 400 px.
const anchoDelBoton = (elemento) =>
  Math.round(Math.min(400, Math.max(200, elemento?.clientWidth || 400)))

export const BotonGoogle = ({ onToken, onError, disabled = false }) => {
  const contenedor = useRef(null)
  const [ancho, setAncho] = useState(400)

  useLayoutEffect(() => {
    setAncho(anchoDelBoton(contenedor.current))
  }, [])

  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        className={styles.boton}
        disabled={disabled}
        onClick={() => onError(MENSAJE_SIN_CONFIGURAR)}
      >
        <span className={styles.logo} aria-hidden="true">
          G
        </span>
        Continuar con Google
      </button>
    )
  }

  return (
    <div
      ref={contenedor}
      className={clases(styles.google, disabled && styles.bloqueado)}
      aria-disabled={disabled || undefined}
    >
      <GoogleOAuthProvider clientId={CLIENT_ID} locale="es">
        <GoogleLogin
          onSuccess={(respuesta) => onToken(respuesta.credential)}
          onError={() => onError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.')}
          text="continue_with"
          theme="outline"
          size="large"
          shape="rectangular"
          logo_alignment="center"
          width={ancho}
          locale="es"
        />
      </GoogleOAuthProvider>
    </div>
  )
}
