import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Alert, Avatar, Badge, Button, FormField, Input, RadioGroup } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { completarRegistroSchema, ROLES_REGISTRO } from '@/schemas/auth'
import { nombreCompleto } from '@/utils/formatters'
import styles from './Registro.module.css'

const OPCIONES_ROL = [
  {
    value: ROLES_REGISTRO.TUTORADO,
    label: 'Tutorado',
    description: 'Quiero inscribirme a tutorías',
  },
  { value: ROLES_REGISTRO.TUTOR, label: 'Tutor', description: 'Quiero impartir tutorías' },
]

const NOMBRE_PROVEEDOR = { MICROSOFT: 'Microsoft', GOOGLE: 'Google' }

// Pantalla 02: primer acceso. Nombre y correo vienen del proveedor; solo faltan matricula y rol.
const Registro = () => {
  const { registroPendiente, completarRegistro, descartarRegistro } = useAuth()
  const navigate = useNavigate()
  const perfil = registroPendiente?.perfil ?? {}
  const proveedor = NOMBRE_PROVEEDOR[perfil.proveedor] ?? 'tu proveedor'
  const nombre = nombreCompleto(perfil)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(completarRegistroSchema),
    defaultValues: { matricula: '', rol: ROLES_REGISTRO.TUTORADO },
  })

  const enviar = handleSubmit(async (datos) => {
    const res = await completarRegistro(datos)
    if (res.ok) return
    if (res.vencido) {
      navigate(ROUTES.login, { replace: true, state: { aviso: res.message } })
      return
    }
    // La matricula duplicada llega como error del campo.
    if (res.errores?.matricula) setError('matricula', { message: res.errores.matricula })
    else setError('root', { message: res.message })
  })

  const entrarConOtra = () => {
    descartarRegistro()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <AuthLayout
      eyebrow="Primer acceso"
      brandTitle="Ya casi terminas"
      brandSubtitle="Tu nombre y tu correo vienen de tu cuenta. Solo falta tu matrícula y el rol con el que usarás el sistema."
      pasos={[
        { texto: `Cuenta de ${proveedor} verificada`, estado: 'hecho' },
        { texto: 'Matrícula y rol', estado: 'actual' },
        { texto: 'Entrar a tu panel', estado: 'pendiente' },
      ]}
      title="Completar registro"
      subtitle="Revisa tus datos y completa lo que falta."
      footer={
        <>
          ¿No es tu cuenta?
          <button type="button" className={styles.enlace} onClick={entrarConOtra}>
            Entrar con otra
          </button>
        </>
      }
    >
      <form className={styles.formulario} onSubmit={enviar} noValidate>
        {errors.root ? <Alert tone="error">{errors.root.message}</Alert> : null}

        <div className={styles.perfil}>
          <Avatar nombre={nombre || perfil.correo} size="lg" />
          <div className={styles.datos}>
            <strong>{nombre || 'Sin nombre'}</strong>
            <span>{perfil.correo}</span>
          </div>
          {perfil.proveedor ? <Badge tone="neutral">{perfil.proveedor}</Badge> : null}
        </div>

        <FormField
          label="Matrícula institucional"
          htmlFor="matricula"
          hint="Tal como aparece en tu credencial. Debe ser única: no puede estar registrada con otra cuenta."
          error={errors.matricula?.message}
        >
          <Input
            id="matricula"
            placeholder="S24011236"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            {...register('matricula')}
          />
        </FormField>

        <Controller
          control={control}
          name="rol"
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              legend="¿Cómo usarás el sistema?"
              options={OPCIONES_ROL}
              value={field.value}
              onChange={field.onChange}
              error={errors.rol?.message}
            />
          )}
        />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className={styles.enviar}>
          {isSubmitting ? 'Creando tu cuenta…' : 'Crear cuenta y continuar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Registro
