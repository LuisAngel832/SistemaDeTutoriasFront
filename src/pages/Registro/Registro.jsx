import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, FormField, Input, PasswordInput, RadioGroup } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../features/auth/AuthContext'
import { AuthLayout } from '../../features/auth/components/AuthLayout'
import { clases } from '../../utils/clases'
import styles from './Registro.module.css'

const OPCIONES_ROL = [
  { value: 'tutorado', label: 'Tutorado', description: 'Quiero inscribirme a tutorias' },
  { value: 'tutor', label: 'Tutor', description: 'Quiero impartir tutorias' },
]

// Ids de rol que espera el backend en el registro.
const ROL_IDS = { tutor: 2, tutorado: 3 }

const CARACTERISTICAS = [
  'Acceso inmediato a tutorias activas',
  'Inscripcion y cancelacion en un click',
  'Tu historial siempre disponible',
]

const MIN_CARACTERES_CONTRASENA = 8

const CAMPOS_INICIALES = {
  rol: 'tutorado',
  nombre: '',
  matricula: '',
  apellidoP: '',
  apellidoM: '',
  correo: '',
  pwd: '',
}

const Registro = () => {
  const { registro } = useAuth()
  const navigate = useNavigate()

  const [campos, setCampos] = useState(CAMPOS_INICIALES)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const actualizar = (campo, valor) => {
    setCampos((actuales) => ({ ...actuales, [campo]: valor }))
    setError('')
  }

  const alCambiar = (campo) => (evento) => actualizar(campo, evento.target.value)

  const enviar = async (evento) => {
    evento.preventDefault()

    const faltanCampos = Object.values(campos).some((valor) => !String(valor).trim())
    if (faltanCampos) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (campos.pwd.length < MIN_CARACTERES_CONTRASENA) {
      setError(`La contrasena debe tener al menos ${MIN_CARACTERES_CONTRASENA} caracteres`)
      return
    }

    setEnviando(true)
    const res = await registro({ ...campos, rol: ROL_IDS[campos.rol] })
    if (!res.ok) {
      setError(res.message)
      setEnviando(false)
      return
    }
    navigate(ROUTES.login, { state: { registrado: true } })
  }

  return (
    <AuthLayout
      wide
      brandTitle="Crea tu cuenta"
      brandSubtitle="Registrate como tutor o tutorado y comienza a aprovechar las tutorias de tu universidad."
      features={CARACTERISTICAS}
      title="Registro"
      subtitle="Completa tus datos para crear la cuenta."
      footer={
        <>
          ¿Ya tienes cuenta?<Link to={ROUTES.login}>Iniciar sesion</Link>
        </>
      }
    >
      <form className={styles.formulario} onSubmit={enviar} noValidate>
        {error ? (
          <Alert tone="error" className={styles.completo}>
            {error}
          </Alert>
        ) : null}

        <RadioGroup
          className={styles.completo}
          name="rol"
          legend="Tipo de cuenta que quieres crear"
          options={OPCIONES_ROL}
          value={campos.rol}
          onChange={(valor) => actualizar('rol', valor)}
        />

        <FormField label="Nombre(s)" htmlFor="nombre">
          <Input
            id="nombre"
            placeholder="Luis"
            value={campos.nombre}
            onChange={alCambiar('nombre')}
            autoComplete="given-name"
          />
        </FormField>

        <FormField label="Matricula institucional" htmlFor="matricula">
          <Input
            id="matricula"
            placeholder="Ej. 20230001"
            value={campos.matricula}
            onChange={alCambiar('matricula')}
            autoComplete="username"
            inputMode="numeric"
          />
        </FormField>

        <FormField label="Apellido paterno" htmlFor="apellidoP">
          <Input
            id="apellidoP"
            placeholder="Perez"
            value={campos.apellidoP}
            onChange={alCambiar('apellidoP')}
            autoComplete="family-name"
          />
        </FormField>

        <FormField label="Apellido materno" htmlFor="apellidoM">
          <Input
            id="apellidoM"
            placeholder="Lopez"
            value={campos.apellidoM}
            onChange={alCambiar('apellidoM')}
          />
        </FormField>

        <FormField
          label="Correo electronico de contacto"
          htmlFor="correo"
          className={styles.completo}
        >
          <Input
            id="correo"
            type="email"
            placeholder="luis@example.com"
            value={campos.correo}
            onChange={alCambiar('correo')}
            autoComplete="email"
          />
        </FormField>

        <FormField
          label="Contrasena para tu cuenta"
          htmlFor="pwd"
          hint={`Debe tener al menos ${MIN_CARACTERES_CONTRASENA} caracteres.`}
          className={styles.completo}
        >
          <PasswordInput
            id="pwd"
            placeholder={`Minimo ${MIN_CARACTERES_CONTRASENA} caracteres`}
            value={campos.pwd}
            onChange={alCambiar('pwd')}
            autoComplete="new-password"
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={enviando}
          className={clases(styles.completo, styles.enviar)}
        >
          {enviando ? 'Registrando...' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Registro
