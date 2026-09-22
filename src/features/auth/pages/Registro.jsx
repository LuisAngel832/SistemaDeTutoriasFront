import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, FormField, Input, PasswordInput, RadioGroup } from '@/components/ui'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { MIN_CARACTERES_CONTRASENA, registroSchema } from '@/schemas/auth'
import { clases } from '@/utils/clases'
import styles from './Registro.module.css'

const OPCIONES_ROL = [
  { value: ROLES.TUTORADO, label: 'Tutorado', description: 'Quiero inscribirme a tutorías' },
  { value: ROLES.TUTOR, label: 'Tutor', description: 'Quiero impartir tutorías' },
]

// Ids de rol que espera el backend en el registro.
const ROL_IDS = { [ROLES.TUTOR]: 2, [ROLES.TUTORADO]: 3 }

const CARACTERISTICAS = [
  'Acceso inmediato a tutorías activas',
  'Inscripción y cancelación en un clic',
  'Tu historial siempre disponible',
]

const Registro = () => {
  const { registro } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      rol: ROLES.TUTORADO,
      nombre: '',
      matricula: '',
      apellidoP: '',
      apellidoM: '',
      correo: '',
      pwd: '',
    },
  })

  const enviar = handleSubmit(async (datos) => {
    const res = await registro({ ...datos, rol: ROL_IDS[datos.rol] })
    if (!res.ok) {
      setError('root', { message: res.message })
      return
    }
    navigate(ROUTES.login, { state: { registrado: true } })
  })

  return (
    <AuthLayout
      wide
      brandTitle="Crea tu cuenta"
      brandSubtitle="Regístrate como tutor o tutorado y comienza a aprovechar las tutorías de tu universidad."
      features={CARACTERISTICAS}
      title="Registro"
      subtitle="Completa tus datos para crear la cuenta."
      footer={
        <>
          ¿Ya tienes cuenta?<Link to={ROUTES.login}>Iniciar sesión</Link>
        </>
      }
    >
      <form className={styles.formulario} onSubmit={enviar} noValidate>
        {errors.root ? (
          <Alert tone="error" className={styles.completo}>
            {errors.root.message}
          </Alert>
        ) : null}

        <Controller
          control={control}
          name="rol"
          render={({ field }) => (
            <RadioGroup
              className={styles.completo}
              name={field.name}
              legend="Tipo de cuenta que quieres crear"
              options={OPCIONES_ROL}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <FormField label="Nombre(s)" htmlFor="nombre" error={errors.nombre?.message}>
          <Input id="nombre" placeholder="Luis" autoComplete="given-name" {...register('nombre')} />
        </FormField>

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

        <FormField label="Apellido paterno" htmlFor="apellidoP" error={errors.apellidoP?.message}>
          <Input
            id="apellidoP"
            placeholder="Pérez"
            autoComplete="family-name"
            {...register('apellidoP')}
          />
        </FormField>

        <FormField label="Apellido materno" htmlFor="apellidoM" error={errors.apellidoM?.message}>
          <Input id="apellidoM" placeholder="López" {...register('apellidoM')} />
        </FormField>

        <FormField
          label="Correo electrónico de contacto"
          htmlFor="correo"
          className={styles.completo}
          error={errors.correo?.message}
        >
          <Input
            id="correo"
            type="email"
            placeholder="luis@example.com"
            autoComplete="email"
            {...register('correo')}
          />
        </FormField>

        <FormField
          label="Contraseña para tu cuenta"
          htmlFor="pwd"
          hint={`Debe tener al menos ${MIN_CARACTERES_CONTRASENA} caracteres.`}
          className={styles.completo}
          error={errors.pwd?.message}
        >
          <PasswordInput
            id="pwd"
            placeholder={`Mínimo ${MIN_CARACTERES_CONTRASENA} caracteres`}
            autoComplete="new-password"
            {...register('pwd')}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          className={clases(styles.completo, styles.enviar)}
        >
          {isSubmitting ? 'Registrando…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Registro
