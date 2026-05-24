import { Link } from 'react-router-dom'
import HeaderTR from '../../components/Tutorado/HeaderTR'
import { useTutoriasTutorado } from '../../hooks/useTutoriasTutorado'
import './misTutorias.css'

const ESTADO_CLASS = {
  PROGRAMADA: 'programada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
}

const formatFecha = (fecha) => {
  if (!fecha) return '—'
  try {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}

const formatHora = (hora) => (hora ? hora.slice(0, 5) : '—')

// El endpoint /asistencia/mis-inscripciones puede devolver dos shapes segun el back:
//   A) DTO viejo: { matricula, nombre, asistio }  -> faltan datos para renderizar
//   B) DTO enriquecido: { idAsistencia, asistio, tutoria: {...} }
// Esta funcion intenta sacar lo util de cualquiera de los dos.
const normalizar = (item, index) => {
  const tutoria = item.tutoria || item
  return {
    key: item.idAsistencia ?? tutoria.id ?? tutoria.idTutoria ?? `item-${index}`,
    idTutoria: tutoria.id ?? tutoria.idTutoria,
    materia: tutoria.materia,
    fecha: tutoria.fecha,
    horaInicio: tutoria.horaInicio ?? tutoria.horario?.horaInicio,
    horaFin: tutoria.horaFin ?? tutoria.horario?.horaFin,
    estado: tutoria.estado,
    edificio: tutoria.edificio,
    aula: tutoria.aula,
    nombreTutor: tutoria.nombreTutor ?? tutoria.horario?.tutor?.nombre,
  }
}

const Card = ({ item }) => {
  const estadoClass = ESTADO_CLASS[item.estado?.toUpperCase()] || 'otro'
  const sinDatos = !item.materia && !item.fecha

  if (sinDatos) {
    return (
      <article className="mt-card missing">
        <p className="mt-missing-title">Inscripcion sin detalles</p>
        <p className="mt-missing-desc">
          El backend aun no expone la informacion de esta tutoria.
        </p>
      </article>
    )
  }

  return (
    <article className="mt-card">
      <div className="mt-card-top">
        <div className="mt-titles">
          <h3 className="mt-materia">{item.materia || 'Materia sin nombre'}</h3>
          {item.nombreTutor ? (
            <p className="mt-tutor">Imparte {item.nombreTutor}</p>
          ) : null}
        </div>
        {item.estado ? (
          <span className={`mt-estado ${estadoClass}`}>{item.estado}</span>
        ) : null}
      </div>

      <div className="mt-info">
        <span className="mt-label">Fecha</span>
        <span>{formatFecha(item.fecha)}</span>

        <span className="mt-label">Horario</span>
        <span>
          {formatHora(item.horaInicio)} – {formatHora(item.horaFin)}
        </span>

        {item.edificio != null || item.aula != null ? (
          <>
            <span className="mt-label">Lugar</span>
            <span>
              Edificio {item.edificio ?? '—'} · Aula {item.aula ?? '—'}
            </span>
          </>
        ) : null}
      </div>

      {item.idTutoria ? (
        <Link to={`/tutorado/infoTutoria/${item.idTutoria}`} className="mt-card-cta">
          Ver detalle →
        </Link>
      ) : null}
    </article>
  )
}

const MisTutorias = () => {
  const { tutorias, isLoading, error } = useTutoriasTutorado()

  const normalizadas = tutorias.map(normalizar)
  const todasSinDatos = normalizadas.length > 0 && normalizadas.every((t) => !t.materia)

  return (
    <div className="mt-page">
      <HeaderTR />

      <main className="mt-main">
        <div className="mt-header">
          <h1>Mis Tutorias</h1>
          <p className="mt-subtitle">
            Las tutorias en las que estas inscrito.
          </p>
        </div>

        {error ? <div className="mt-error">{error}</div> : null}

        {todasSinDatos ? (
          <div className="mt-warning">
            <strong>Funcionalidad parcialmente disponible.</strong>
            <span>
              El backend devuelve {normalizadas.length} inscripcion
              {normalizadas.length === 1 ? '' : 'es'} pero sin los datos de la tutoria.
              Ver{' '}
              <a
                href="https://github.com/Shtven/TutoriasBackend/issues/8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-warning-link"
              >
                issue #8
              </a>
              .
            </span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-grid">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="mt-skeleton" />
            ))}
          </div>
        ) : normalizadas.length === 0 && !error ? (
          <div className="mt-empty">
            <h3>Aun no tienes inscripciones</h3>
            <p>Explora las tutorias disponibles y reserva tu lugar.</p>
            <Link to="/tutorado/home" className="mt-empty-cta">
              Explorar tutorias
            </Link>
          </div>
        ) : (
          <div className="mt-grid">
            {normalizadas.map((item) => (
              <Card key={item.key} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MisTutorias
