import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useState } from 'react'
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
import { IconBuscar } from '@/components/ui/icons'
import { MAX_CARACTERES_EE } from '@/constants/tutoria'
import { useExperiencias } from '@/features/admin/hooks/useExperiencias'
import { useValorDiferido } from '@/features/tutorias/hooks/useValorDiferido'
import { materiaSchema } from '@/schemas/materia'
import { avisar } from '@/utils/avisos'
import { clases } from '@/utils/clases'
import { pluralizar } from '@/utils/formatters'
import styles from './ExperienciasEducativas.module.css'

const VACIO = { nombre: '', nrc: '' }

// Pantalla 16: catalogo de Experiencias Educativas, con alta, edicion y eliminacion.
const ExperienciasEducativas = () => {
  const [busqueda, setBusqueda] = useState('')
  const q = useValorDiferido(busqueda.trim())
  const datos = useExperiencias(q)
  // EE que se esta editando en el panel derecho; null = agregar una nueva.
  const [editando, setEditando] = useState(null)

  return (
    <Pagina>
      <EncabezadoPagina
        title="Experiencias Educativas"
        subtitle="El catálogo que eligen los tutores al crear una tutoría."
      />

      <div className={styles.grid}>
        <Card as="section" padding="lg" aria-labelledby="titulo-catalogo">
          <div className={styles.encabezado}>
            <h2 className={styles.titulo} id="titulo-catalogo">
              Catálogo <span className={styles.cantidad}>{datos.materias.length}</span>
            </h2>
            <div className={styles.buscador}>
              <span className={styles.icono} aria-hidden="true">
                <IconBuscar />
              </span>
              <Input
                type="search"
                className={styles.campo}
                aria-label="Buscar por nombre o NRC"
                placeholder="Buscar por nombre o NRC…"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>
          </div>

          {datos.error ? <Alert tone="error">{datos.error}</Alert> : null}

          {datos.isLoading ? (
            <Skeleton height={320} />
          ) : datos.materias.length ? (
            <div className={styles.tablaContenedor}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">NRC</th>
                    <th scope="col">Experiencia Educativa</th>
                    <th scope="col" className={styles.derecha}>
                      Tutorías activas
                    </th>
                    <th scope="col">
                      <span className={styles.oculto}>Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {datos.materias.map((materia) => (
                    <tr
                      key={materia.idMateria}
                      className={clases(
                        editando?.idMateria === materia.idMateria && styles.seleccionada,
                      )}
                    >
                      <td className={styles.nrc}>{materia.nrc}</td>
                      <th scope="row">{materia.nombre}</th>
                      <td className={styles.derecha}>{materia.tutoriasActivas ?? 0}</td>
                      <td className={styles.derecha}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditando(materia)}
                          aria-label={`Editar ${materia.nombre}`}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              compact
              description={
                q ? `No hay Experiencias Educativas para "${q}".` : 'El catálogo está vacío.'
              }
            />
          )}
        </Card>

        <PanelExperiencia
          key={editando?.idMateria ?? 'nueva'}
          materia={editando}
          datos={datos}
          onTerminar={() => setEditando(null)}
        />
      </div>
    </Pagina>
  )
}

// Panel derecho: agregar una EE o, con `materia`, editarla o eliminarla (diseno propio).
const PanelExperiencia = ({ materia, datos, onTerminar }) => {
  const idTitulo = useId()
  const editar = Boolean(materia)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const valores = editar ? { nombre: materia.nombre, nrc: String(materia.nrc) } : VACIO

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({ resolver: zodResolver(materiaSchema), defaultValues: valores })

  useEffect(() => {
    if (editar) setFocus('nombre')
  }, [editar, setFocus])

  const guardar = handleSubmit(async (formulario) => {
    const res = editar
      ? await datos.actualizar(materia.idMateria, formulario)
      : await datos.crear(formulario)
    if (res.ok) {
      avisar(res)
      reset(VACIO)
      onTerminar()
      return
    }
    // NRC duplicado y otros errores de un campo van debajo del campo.
    const campos = Object.entries(res.errores ?? {}).filter(([campo]) => campo in VACIO)
    if (campos.length) campos.forEach(([campo, mensaje]) => setError(campo, { message: mensaje }))
    else setError('root', { message: res.message })
  })

  const eliminar = async () => {
    const res = await datos.eliminar(materia.idMateria)
    setConfirmandoEliminar(false)
    avisar(res)
    if (res.ok) onTerminar()
  }

  const conTutorias = (materia?.tutoriasActivas ?? 0) > 0

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo} className={styles.panel}>
      <h2 className={styles.titulo} id={idTitulo}>
        {editar ? 'Editar Experiencia Educativa' : 'Agregar Experiencia Educativa'}
      </h2>
      <p className={styles.texto}>
        {editar
          ? 'El cambio se verá en las tutorías que ya la usan.'
          : 'Aparecerá en la lista de los tutores al crear una tutoría.'}
      </p>

      <form className={styles.formulario} onSubmit={guardar} noValidate>
        {errors.root ? (
          <Alert tone="error" compact>
            {errors.root.message}
          </Alert>
        ) : null}
        <FormField label="Nombre" htmlFor="ee-nombre" error={errors.nombre?.message}>
          <Input
            id="ee-nombre"
            maxLength={MAX_CARACTERES_EE}
            placeholder="Arquitectura de Computadoras"
            {...register('nombre')}
          />
        </FormField>
        <FormField
          label="NRC"
          htmlFor="ee-nrc"
          hint="Cada NRC solo puede pertenecer a una Experiencia Educativa."
          error={errors.nrc?.message}
        >
          <Input id="ee-nrc" inputMode="numeric" placeholder="52325" {...register('nrc')} />
        </FormField>

        {editar ? (
          <div className={styles.acciones}>
            <Button type="submit" fullWidth loading={datos.guardando}>
              Guardar cambios
            </Button>
            <Button variant="secondary" fullWidth onClick={onTerminar}>
              Cancelar
            </Button>
            <Button
              variant="danger-outline"
              fullWidth
              disabled={conTutorias || datos.eliminando}
              onClick={() => setConfirmandoEliminar(true)}
            >
              Eliminar
            </Button>
            {conTutorias ? (
              <p className={styles.nota}>
                No se puede eliminar: tiene{' '}
                {pluralizar(materia.tutoriasActivas, 'tutoría activa', 'tutorías activas')}.
              </p>
            ) : null}
          </div>
        ) : (
          <Button type="submit" fullWidth loading={datos.guardando}>
            Agregar
          </Button>
        )}
      </form>

      {editar ? (
        <ConfirmDialog
          open={confirmandoEliminar}
          tone="danger"
          title="¿Eliminar la Experiencia Educativa?"
          description={`${materia.nombre} (NRC ${materia.nrc}) dejará de aparecer en el catálogo. Solo se puede eliminar si ninguna tutoría la ha usado.`}
          confirmLabel="Sí, eliminar"
          loading={datos.eliminando}
          onConfirm={eliminar}
          onCancel={() => setConfirmandoEliminar(false)}
        />
      ) : null}
    </Card>
  )
}

export default ExperienciasEducativas
