import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useTutoriasTutorado } from '../../hooks/useTutoriasTutorado'
import { formatFecha, formatRangoHora, SIN_DATO } from '../../utils/formatters'
import { getEstadoClass } from '../../utils/tutoria'
import './misTutorias.css'

const Card = ({ item }) => {
  const estadoClass = getEstadoClass(item.estado)
  const sinDatos = !item.materia && !item.fecha

  if (sinDatos) {
    return (
      <article className="mt-card missing">
        <p className="mt-missing-title">Inscripcion sin detalles</p>
        <p className="mt-missing-desc">El backend aun no expone la informacion de esta tutoria.</p>
      </article>
    )
  }

  return (
    <article className="mt-card">
      <div className="mt-card-top">
        <div className="mt-titles">
          <h3 className="mt-experiencia">{item.materia || 'Experiencia Educativa sin nombre'}</h3>
          {item.nombreTutor ? <p className="mt-tutor">Imparte {item.nombreTutor}</p> : null}
        </div>
        {item.estado ? <span className={`mt-estado ${estadoClass}`}>{item.estado}</span> : null}
      </div>

      <div className="mt-info">
        <span className="mt-label">Fecha</span>
        <span>{formatFecha(item.fecha)}</span>

        <span className="mt-label">Horario</span>
        <span>{formatRangoHora(item.horaInicio, item.horaFin)}</span>

        {item.edificio != null || item.aula != null ? (
          <>
            <span className="mt-label">Lugar</span>
            <span>
              Edificio {item.edificio ?? SIN_DATO} · Aula {item.aula ?? SIN_DATO}
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

  // Las inscripciones llegan normalizadas por mapInscripcion (ver src/api/mappers.js).
  const normalizadas = tutorias
  const todasSinDatos = normalizadas.length > 0 && normalizadas.every((t) => !t.materia)

  return (
    <AppLayout className="mt-page">
      <main className="mt-main">
        <div className="mt-header">
          <h1>Mis Tutorias</h1>
          <p className="mt-subtitle">Las tutorias en las que estas inscrito.</p>
        </div>

        {error ? <div className="mt-error">{error}</div> : null}

        {todasSinDatos ? (
          <div className="mt-warning">
            <strong>Funcionalidad parcialmente disponible.</strong>
            <span>
              El backend devuelve {normalizadas.length} inscripcion
              {normalizadas.length === 1 ? '' : 'es'} pero sin los datos de la tutoria. Ver{' '}
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
              <Card key={item.idAsistencia ?? item.idTutoria} item={item} />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  )
}

export default MisTutorias
