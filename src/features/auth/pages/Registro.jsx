import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, FormField, Input, PasswordInput, RadioGroup } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { MIN_CARACTERES_CONTRASENA, registroSchema, ROLES_REGISTRO } from '@/schemas/auth'
import { clases } from '@/utils/clases'
import styles from './Registro.module.css'

const OPCIONES_ROL = [
  {
    value: ROLES_REGISTRO.TUTORADO,
    label: 'Tutorado',
    description: 'Quiero inscribirme a tutorías',
  },
  { value: ROLES_REGISTRO.TUTOR, label: 'Tutor', description: 'Quiero impartir tutorías' },
]

const CARACTERISTICAS = [
  'Inscríbete a las tutorías que necesites',
  'Recibe confirmaciones y recordatorios por correo',
  'Consulta tu asistencia en cada tutoría',
]

const CAMPOS = ['rol', 'nombre', 'apellidos', 'matricula', 'correo', 'pwd']

// Pantalla 02: crear cuenta con matricula, correo, contrasena y rol.
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
      rol: ROLES_REGISTRO.TUTORADO,
      nombre: '',
      apellidos: '',
      matricula: '',
      correo: '',
      pwd: '',
    },
  })

  const enviar = handleSubmit(async (datos) => {
    const res = await registro(datos)
    if (res.ok) {
      // Si el backend ya inicio la sesion, SoloInvitados lleva al panel.
      if (!res.sesionIniciada) navigate(ROUTES.login, { state: { registrado: true } })
      return
    }
    // La matricula o el correo duplicados llegan como error de su campo.
    const campos = Object.entries(res.errores ?? {}).filter(([campo]) => CAMPOS.includes(campo))
    if (campos.length) campos.forEach(([campo, mensaje]) => setError(campo, { message: mensaje }))
    else setError('root', { message: res.message })
  })

  return (
    <AuthLayout
      brandTitle="Crea tu cuenta"
      brandSubtitle="Regístrate como tutor o tutorado y empieza a usar las tutorías de tu facultad."
      features={CARACTERISTICAS}
      title="Crear cuenta"
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
              legend="¿Cómo usarás el sistema?"
              options={OPCIONES_ROL}
              value={field.value}
              onChange={field.onChange}
              error={errors.rol?.message}
            />
          )}
        />

        <FormField label="Nombre(s)" htmlFor="nombre" error={errors.nombre?.message}>
          <Input id="nombre" autoComplete="given-name" {...register('nombre')} />
        </FormField>

        <FormField label="Apellidos" htmlFor="apellidos" error={errors.apellidos?.message}>
          <Input id="apellidos" autoComplete="family-name" {...register('apellidos')} />
        </FormField>

        <FormField
          label="Matrícula institucional"
          htmlFor="matricula"
          hint="Tal como aparece en tu credencial."
          error={errors.matricula?.message}
        >
          <Input
            id="matricula"
            placeholder="S24011236"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            {...register('matricula')}
          />
        </FormField>

        <FormField label="Correo electrónico" htmlFor="correo" error={errors.correo?.message}>
          <Input
            id="correo"
            type="email"
            placeholder="zS24011236@estudiantes.uv.mx"
            autoComplete="email"
            {...register('correo')}
          />
        </FormField>

        <FormField
          label="Contraseña"
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
          {isSubmitting ? 'Creando tu cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Registro
