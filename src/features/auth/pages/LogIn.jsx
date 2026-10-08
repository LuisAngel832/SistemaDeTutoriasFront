import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Spinner } from '@/components/ui'
import { IconCorreo } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { BotonGoogle } from '@/features/auth/proveedores/BotonGoogle'
import { obtenerIdTokenMicrosoft, prepararMicrosoft } from '@/features/auth/proveedores/microsoft'
import styles from './LogIn.module.css'
import botones from '@/features/auth/proveedores/BotonProveedor.module.css'

const CARACTERISTICAS = [
  'Grupos de hasta 7 tutorados por tutoría',
  'Recordatorio por correo 2 horas antes de cada sesión',
  'Tu historial de asistencia siempre a la mano',
]

const LogIn = () => {
  const { entrarConProveedor, sesionExpirada } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Proveedor con el que se esta entrando ('microsoft' | 'google'), para bloquear los botones.
  const [entrando, setEntrando] = useState(null)
  const [error, setError] = useState('')

  // MSAL se prepara al abrir la pantalla para que el popup se abra en el mismo clic.
  useEffect(() => {
    prepararMicrosoft().catch(() => {})
  }, [])

  const entrar = async (proveedor, obtenerIdToken) => {
    setError('')
    setEntrando(proveedor)
    try {
      const idToken = await obtenerIdToken()
      // Ventana cerrada por el usuario: no es un error.
      if (!idToken) return
      const res = await entrarConProveedor(proveedor, idToken)
      if (!res.ok) setError(res.message)
      // Con un usuario registrado SoloInvitados redirige; en el primer acceso se completa el
      // registro (se conserva la pagina pedida para despues).
      else if (res.registroPendiente) navigate(ROUTES.registro, { state: location.state })
    } catch (err) {
      setError(err.message)
    } finally {
      setEntrando(null)
    }
  }

  const aviso = location.state?.aviso
    ? { tono: 'warning', texto: location.state.aviso }
    : sesionExpirada
      ? { tono: 'warning', texto: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.' }
      : null

  return (
    <AuthLayout
      brandTitle="Bienvenido de vuelta"
      brandSubtitle="Inscríbete a tutorías, pasa lista y consulta tu asistencia desde un solo lugar."
      features={CARACTERISTICAS}
      title="Iniciar sesión"
      subtitle="Entra con tu cuenta institucional de Microsoft o con tu cuenta de Google."
    >
      <div className={styles.contenido} aria-busy={Boolean(entrando)}>
        {error ? (
          <Alert tone="error">{error}</Alert>
        ) : aviso ? (
          <Alert tone={aviso.tono}>{aviso.texto}</Alert>
        ) : null}

        <button
          type="button"
          className={botones.boton}
          disabled={Boolean(entrando)}
          onClick={() => entrar('microsoft', obtenerIdTokenMicrosoft)}
        >
          {entrando === 'microsoft' ? (
            <Spinner size="sm" />
          ) : (
            <span className={botones.logo} aria-hidden="true">
              M
            </span>
          )}
          {entrando === 'microsoft' ? 'Conectando con Microsoft…' : 'Continuar con Microsoft'}
        </button>

        <BotonGoogle
          disabled={Boolean(entrando)}
          onToken={(credential) => entrar('google', async () => credential)}
          onError={setError}
        />

        {entrando === 'google' ? (
          <p className={styles.estado} role="status">
            <Spinner size="sm" /> Verificando tu cuenta…
          </p>
        ) : null}

        <div className={styles.primeraVez}>
          <strong>¿Es tu primera vez?</strong>
          <p>
            Al continuar te pediremos tu matrícula y tu rol para crear tu cuenta. No necesitas
            contraseña.
          </p>
        </div>

        <div className={styles.divisor} aria-hidden="true">
          <IconCorreo />
        </div>
        <p className={styles.nota}>
          Te enviaremos confirmaciones, recordatorios y avisos de cancelación o baja al correo de tu
          cuenta.
        </p>
      </div>
    </AuthLayout>
  )
}

export default LogIn
