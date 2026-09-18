import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Pagina } from '../../../components/layout/Pagina'
import { Alert, Button, Card } from '../../../components/ui'
import { MIN_MINUTOS_CANCELACION } from '../../../constants/tutoria'
import { ROUTES } from '../../../constants/routes'
import Comentarios from '../../../features/comentarios/Comentarios'
import { AccionesTutoria } from '../../../features/tutorias/components/AccionesTutoria'
import {
  DetalleCargando,
  DetalleError,
  DetalleTutoriaLayout,
  EncabezadoTutoria,
  ListaTemas,
  SeccionTutoria,
} from '../../../features/tutorias/components/DetalleTutoria'
import { EditarTutoriaForm } from '../../../features/tutorias/components/EditarTutoriaForm'
import { InscritosList } from '../../../features/tutorias/components/InscritosList'
import { TemasInput } from '../../../features/tutorias/components/TemasInput'
import { TutoriaInfoGrid } from '../../../features/tutorias/components/TutoriaInfoGrid'
import { useAhora } from '../../../hooks/useAhora'
import useHorarios from '../../../hooks/useHorarios'
import useTutoriaDetalleTutor from '../../../hooks/useTutoriaDetalleTutor'
import { minutosHasta } from '../../../utils/fechas'
import { esProgramada, yaTuvoLugar } from '../../../utils/tutoria'
import styles from './TutoriaDetalle.module.css'

const Volver = () => (
  <Button as={Link} to={ROUTES.tutor.inicio} variant="secondary" size="sm">
    ← Mis tutorías
  </Button>
)

const TutoriaDetalleTutor = () => {
  const { id } = useParams()
  const detalle = useTutoriaDetalleTutor(id)
  const { tutoria, inscritos, isLoading, error, isSubmitting } = detalle
  const { horarios } = useHorarios()
  const ahora = useAhora()

  const [editando, setEditando] = useState(false)
  const [resultado, setResultado] = useState(null)

  // Muestra el resultado de una accion y lo devuelve para quien la llamo.
  const informar = (res) => {
    setResultado({ tone: res.ok ? 'success' : 'error', texto: res.message })
    return res
  }

  if (isLoading) {
    return (
      <Pagina>
        <DetalleCargando back={<Volver />} />
      </Pagina>
    )
  }

  if (error || !tutoria) {
    return (
      <Pagina>
        <DetalleError
          message={error || 'No se encontró la tutoría.'}
          to={ROUTES.tutor.inicio}
          linkLabel="Volver a mis tutorías"
        />
      </Pagina>
    )
  }

  const programada = esProgramada(tutoria)
  // Reglas del backend: solo se completa una tutoria que ya inicio y solo se cancela
  // con mas de MIN_MINUTOS_CANCELACION minutos de anticipacion.
  const minutosParaInicio = minutosHasta(tutoria.fecha, tutoria.horaInicio, ahora)
  const puedeCompletar = minutosParaInicio != null && minutosParaInicio <= 0
  const puedeCancelar = minutosParaInicio == null || minutosParaInicio > MIN_MINUTOS_CANCELACION

  const guardar = async (payload) => {
    const res = await detalle.actualizar(payload)
    if (res.ok) {
      setEditando(false)
      informar(res)
    }
    return res
  }

  const agregarTema = async (texto) => {
    const res = await detalle.agregarTema(texto)
    if (!res.ok) informar(res)
  }

  const quitarTema = async (tema) => {
    const res = await detalle.quitarTema(tema.idTema)
    if (!res.ok) informar(res)
  }

  const principal = editando ? (
    <>
      <EncabezadoTutoria tutoria={tutoria} />
      <EditarTutoriaForm
        tutoria={tutoria}
        horarios={horarios}
        isSubmitting={isSubmitting}
        onGuardar={guardar}
        onCancelar={() => setEditando(false)}
      />
    </>
  ) : (
    <>
      <EncabezadoTutoria tutoria={tutoria} />
      <TutoriaInfoGrid tutoria={tutoria} />
      <SeccionTutoria title="Temas a revisar">
        {programada ? (
          <TemasInput
            compact
            label="Tema nuevo para esta tutoría"
            temas={tutoria.temas}
            onAdd={agregarTema}
            onRemove={quitarTema}
            canRemove={(tema) => Boolean(tema.idTema)}
            disabled={isSubmitting}
            emptyMessage="Aún no hay temas. Agrega el primero."
          />
        ) : (
          <ListaTemas temas={tutoria.temas} />
        )}
      </SeccionTutoria>
      {programada ? (
        <div className={styles.editar}>
          <Button variant="secondary" onClick={() => setEditando(true)}>
            Editar tutoría
          </Button>
        </div>
      ) : null}
    </>
  )

  return (
    <Pagina>
      <DetalleTutoriaLayout
        back={<Volver />}
        notice={resultado ? <Alert tone={resultado.tone}>{resultado.texto}</Alert> : null}
        main={principal}
        aside={
          <>
            <AccionesTutoria
              tutoria={tutoria}
              puedeCompletar={puedeCompletar}
              puedeCancelar={puedeCancelar}
              isSubmitting={isSubmitting}
              onCompletar={async () => informar(await detalle.completar())}
              onCancelar={async () => informar(await detalle.cancelar())}
            />
            <InscritosList inscritos={inscritos} mostrarAsistencia={yaTuvoLugar(tutoria, ahora)} />
          </>
        }
        footer={
          <Card as="section" padding="lg" aria-labelledby="comentarios-titulo">
            <h2 className={styles.comentariosTitulo} id="comentarios-titulo">
              Comentarios de los tutorados
            </h2>
            <p className={styles.comentariosDescripcion}>
              Sugerencias y observaciones previas a la sesión.
            </p>
            <Comentarios idTutoria={id} modo="lectura" />
          </Card>
        }
      />
    </Pagina>
  )
}

export default TutoriaDetalleTutor
