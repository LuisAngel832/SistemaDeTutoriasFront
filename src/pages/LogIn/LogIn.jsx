import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Alert, Button, FormField, Input, PasswordInput } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../features/auth/AuthContext'
import { AuthLayout } from '../../features/auth/components/AuthLayout'
import styles from './LogIn.module.css'

const CARACTERISTICAS = [
  'Programa sesiones de manera sencilla',
  'Da seguimiento a tus tutorados',
  'Mantente al día con tus horarios',
]

const LogIn = () => {
  const { login, sesionExpirada } = useAuth()
  const location = useLocation()

  const [matricula, setMatricula] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (evento) => {
    evento.preventDefault()

    if (!matricula.trim() || !contrasena) {
      setError('Todos los campos son obligatorios')
      return
    }

    setError('')
    setEnviando(true)
    const res = await login(matricula.trim(), contrasena)
    // Con exito no se navega aqui: SoloInvitados redirige a la pagina pedida o al inicio.
    if (!res.ok) {
      setError(res.message)
      setEnviando(false)
    }
  }

  const aviso = sesionExpirada
    ? { tono: 'warning', texto: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.' }
    : location.state?.registrado
      ? { tono: 'success', texto: 'Cuenta creada. Ya puedes iniciar sesión.' }
      : null

  return (
    <AuthLayout
      brandTitle="Bienvenido de vuelta"
      brandSubtitle="Gestiona tus tutorías, horarios e inscripciones desde un solo lugar."
      features={CARACTERISTICAS}
      title="Iniciar sesión"
      subtitle="Ingresa con tu matrícula para continuar."
      footer={
        <>
          ¿No tienes cuenta?<Link to={ROUTES.registro}>Crear cuenta</Link>
        </>
      }
    >
      <form className={styles.formulario} onSubmit={enviar} noValidate>
        {error ? (
          <Alert tone="error">{error}</Alert>
        ) : aviso ? (
          <Alert tone={aviso.tono}>{aviso.texto}</Alert>
        ) : null}

        <FormField label="Matrícula institucional" htmlFor="matricula">
          <Input
            id="matricula"
            placeholder="Ej. 20230001"
            value={matricula}
            onChange={(evento) => {
              setMatricula(evento.target.value)
              setError('')
            }}
            autoComplete="username"
            inputMode="numeric"
          />
        </FormField>

        <FormField label="Contraseña de tu cuenta" htmlFor="contrasena">
          <PasswordInput
            id="contrasena"
            placeholder="Tu contraseña"
            value={contrasena}
            onChange={(evento) => {
              setContrasena(evento.target.value)
              setError('')
            }}
            autoComplete="current-password"
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={enviando} className={styles.enviar}>
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LogIn
