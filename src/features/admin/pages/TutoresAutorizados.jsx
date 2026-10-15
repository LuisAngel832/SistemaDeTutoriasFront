import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { EncabezadoPagina, Pagina } from '@/components/layout/Pagina'
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  FormField,
  Input,
  Skeleton,
} from '@/components/ui'
import { useTutores } from '@/features/admin/hooks/useTutores'
import { autorizarTutorSchema } from '@/schemas/auth'
import { avisar } from '@/utils/avisos'
import styles from './catalogo.module.css'

const VACIO = { nombre: '', apellidos: '', matricula: '', correo: '' }

// Lista de tutores autorizados: solo quien esta en ella puede crear su cuenta como tutor
// (TutoriasBackend, docs/AUTENTICACION.md § 4). El backend no dice quien ya creo su cuenta,
// asi que se ofrece quitar a cualquiera y el backend rechaza a quien ya la creo.
const TutoresAutorizados = () => {
  const datos = useTutores()
  // Tutor cuya autorizacion se va a quitar; abre la confirmacion.
  const [porQuitar, setPorQuitar] = useState(null)

  const quitar = async () => {
    const res = await datos.quitar(porQuitar.matricula)
    setPorQuitar(null)
    avisar(res)
  }

  return (
    <Pagina>
      <EncabezadoPagina
        title="Tutores"
        subtitle="Solo quien está en esta lista puede crear su cuenta como tutor."
      />

      <div className={styles.grid}>
        <Card as="section" padding="lg" aria-labelledby="titulo-tutores">
          <div className={styles.encabezado}>
            <h2 className={styles.titulo} id="titulo-tutores">
              Tutores autorizados <span className={styles.cantidad}>{datos.tutores.length}</span>
            </h2>
          </div>

          {datos.error ? <Alert tone="error">{datos.error}</Alert> : null}

          {datos.isLoading ? (
            <Skeleton height={320} />
          ) : datos.tutores.length ? (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th scope="col">Matrícula</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">
                        <span className={styles.oculto}>Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.tutores.map((tutor) => (
                      <tr key={tutor.matricula}>
                        <td className={styles.codigo}>{tutor.matricula}</td>
                        <th scope="row">{tutor.nombreCompleto}</th>
                        <td className={styles.derecha}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPorQuitar(tutor)}
                            aria-label={`Quitar la autorización de ${tutor.nombreCompleto}`}
                          >
                            Quitar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.notaTabla}>
                Solo se puede quitar a quien todavía no crea su cuenta.
              </p>
            </>
          ) : (
            <EmptyState
              compact
              description="Todavía no hay tutores. Autoriza al primero con el formulario."
            />
          )}
        </Card>

        <PanelAutorizar datos={datos} />
      </div>

      <ConfirmDialog
        open={Boolean(porQuitar)}
        tone="danger"
        title="¿Quitar la autorización?"
        description={
          porQuitar
            ? `${porQuitar.nombreCompleto} (${porQuitar.matricula}) ya no podrá crear su cuenta como tutor. Si ya la creó, no se puede quitar.`
            : ''
        }
        confirmLabel="Sí, quitar"
        loading={datos.quitando}
        onConfirm={quitar}
        onCancel={() => setPorQuitar(null)}
      />
    </Pagina>
  )
}

// Panel derecho: pre-registra la matricula y el correo de un tutor.
const PanelAutorizar = ({ datos }) => {
  const idTitulo = useId()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(autorizarTutorSchema), defaultValues: VACIO })

  const autorizar = handleSubmit(async (formulario) => {
    const res = await datos.autorizar(formulario)
    if (res.ok) {
      avisar(res)
      reset(VACIO)
      return
    }
    // La matricula o el correo ya registrados van debajo de su campo.
    const campos = Object.entries(res.errores ?? {}).filter(([campo]) => campo in VACIO)
    if (campos.length) campos.forEach(([campo, mensaje]) => setError(campo, { message: mensaje }))
    else setError('root', { message: res.message })
  })

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo} className={styles.panel}>
      <h2 className={styles.titulo} id={idTitulo}>
        Autorizar tutor
      </h2>
      <p className={styles.texto}>
        La persona crea su cuenta en «Crear cuenta», con el rol Tutor y esta misma matrícula y
        correo.
      </p>

      <form className={styles.formulario} onSubmit={autorizar} noValidate>
        {errors.root ? (
          <Alert tone="error" compact>
            {errors.root.message}
          </Alert>
        ) : null}
        <FormField label="Nombre(s)" htmlFor="tutor-nombre" error={errors.nombre?.message}>
          <Input id="tutor-nombre" {...register('nombre')} />
        </FormField>
        <FormField label="Apellidos" htmlFor="tutor-apellidos" error={errors.apellidos?.message}>
          <Input id="tutor-apellidos" {...register('apellidos')} />
        </FormField>
        <FormField label="Matrícula" htmlFor="tutor-matricula" error={errors.matricula?.message}>
          <Input
            id="tutor-matricula"
            placeholder="S21008800"
            autoCapitalize="characters"
            spellCheck={false}
            {...register('matricula')}
          />
        </FormField>
        <FormField label="Correo electrónico" htmlFor="tutor-correo" error={errors.correo?.message}>
          <Input
            id="tutor-correo"
            type="email"
            placeholder="zS21008800@estudiantes.uv.mx"
            {...register('correo')}
          />
        </FormField>

        <Button type="submit" fullWidth loading={datos.autorizando}>
          Autorizar
        </Button>
        <p className={styles.nota}>
          Autoriza a cada tutor poco antes de que cree su cuenta: el registro todavía no confirma
          que el correo sea suyo.
        </p>
      </form>
    </Card>
  )
}

export default TutoresAutorizados
