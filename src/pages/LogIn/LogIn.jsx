import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { Alert, Button, FormField, Input, PasswordInput } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../features/auth/AuthContext'
import { AuthLayout } from '../../features/auth/components/AuthLayout'
import { loginSchema } from '../../schemas/auth'
import styles from './LogIn.module.css'

const CARACTERISTICAS = [
  'Programa sesiones de manera sencilla',
  'Da seguimiento a tus tutorados',
  'Mantente al día con tus horarios',
]

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
    defaultValues: { matricula: '', contrasena: '' },
  })

  const enviar = handleSubmit(async ({ matricula, contrasena }) => {
    const res = await login(matricula, contrasena)
    // Con exito no se navega aqui: SoloInvitados redirige a la pagina pedida o al inicio.
    if (!res.ok) setError('root', { message: res.message })
  })

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
        {errors.root ? (
          <Alert tone="error">{errors.root.message}</Alert>
        ) : aviso ? (
          <Alert tone={aviso.tono}>{aviso.texto}</Alert>
        ) : null}

        <FormField
          label="Matrícula institucional"
          htmlFor="matricula"
          error={errors.matricula?.message}
        >
          <Input
            id="matricula"
            placeholder="Ej. 20230001"
            autoComplete="username"
            inputMode="numeric"
            {...register('matricula')}
          />
        </FormField>

        <FormField
          label="Contraseña de tu cuenta"
          htmlFor="contrasena"
          error={errors.contrasena?.message}
        >
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
