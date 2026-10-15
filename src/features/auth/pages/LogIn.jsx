import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { Alert, Button, FormField, Input, PasswordInput } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { loginSchema } from '@/schemas/auth'
import styles from './LogIn.module.css'

const CARACTERISTICAS = [
  'Grupos de hasta 7 tutorados por tutoría',
  'Recordatorio por correo 2 horas antes de cada sesión',
  'Tu historial de asistencia siempre a la mano',
]

// El backend nombra los errores por campo como el body de POST /auth/signin.
const CAMPO_DEL_FORMULARIO = { matricula: 'usuario', correo: 'usuario', pwd: 'contrasena' }

// Pantalla 01: inicio de sesion con correo o matricula y contrasena.
const LogIn = () => {
  const { login, sesionExpirada } = useAuth()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { usuario: '', contrasena: '' },
  })

  const enviar = handleSubmit(async (credenciales) => {
    const res = await login(credenciales)
    // Con exito no se navega aqui: SoloInvitados redirige a la pagina pedida o al inicio.
    if (res.ok) return
    // Credenciales incorrectas (401) y demasiados intentos (429) van arriba del formulario.
    const campos = Object.entries(res.errores ?? {}).filter(
      ([campo]) => campo in CAMPO_DEL_FORMULARIO,
    )
    if (campos.length) {
      campos.forEach(([campo, mensaje]) =>
        setError(CAMPO_DEL_FORMULARIO[campo], { message: mensaje }),
      )
    } else setError('root', { message: res.message })
  })

  const aviso = sesionExpirada
    ? { tono: 'warning', texto: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.' }
    : location.state?.registrado
      ? { tono: 'success', texto: 'Cuenta creada. Ya puedes iniciar sesión.' }
      : null

  return (
    <AuthLayout
      brandTitle="Bienvenido de vuelta"
      brandSubtitle="Inscríbete a tutorías, pasa lista y consulta tu asistencia desde un solo lugar."
      features={CARACTERISTICAS}
      title="Iniciar sesión"
      subtitle="Entra con tu correo o tu matrícula y tu contraseña."
      footer={
        <>
          ¿No tienes cuenta?<Link to={ROUTES.registro}>Crear cuenta</Link>
        </>
      }
    >
      <form className={styles.formulario} onSubmit={enviar} noValidate>
        {errors.root ? (
          <Alert tone="error">{errors.root.message}</Alert>
        ) : aviso ? (
          <Alert tone={aviso.tono}>{aviso.texto}</Alert>
        ) : null}

        <FormField label="Correo o matrícula" htmlFor="usuario" error={errors.usuario?.message}>
          <Input
            id="usuario"
            placeholder="S23014587 o tu correo"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            {...register('usuario')}
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="contrasena" error={errors.contrasena?.message}>
          <PasswordInput
            id="contrasena"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            {...register('contrasena')}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className={styles.enviar}>
          {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LogIn
