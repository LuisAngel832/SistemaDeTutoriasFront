import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HeaderTR from '../../components/Tutorado/HeaderTR'
import { useTutoriasExplorar } from '../../hooks/useTutoriasExplorar'
import './homeTutorado.css'

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

const TutoriaCard = ({ tutoria }) => {
  const estadoClass = ESTADO_CLASS[tutoria.estado?.toUpperCase()] || 'otro'

  return (
    <article className="ex-card">
      <div className="ex-card-top">
        <div className="ex-card-titles">
          <h3 className="ex-materia">{tutoria.materia || 'Materia sin nombre'}</h3>
          {tutoria.nombreTutor ? (
            <p className="ex-tutor">Imparte {tutoria.nombreTutor}</p>
          ) : null}
        </div>
        <span className={`ex-estado ${estadoClass}`}>
          {tutoria.estado || 'SIN ESTADO'}
        </span>
      </div>

      <div className="ex-info">
        <span className="ex-info-label">Fecha</span>
        <span>{formatFecha(tutoria.fecha)}</span>

        <span className="ex-info-label">Horario</span>
        <span>
          {formatHora(tutoria.horaInicio)} – {formatHora(tutoria.horaFin)}
        </span>

        <span className="ex-info-label">Lugar</span>
        <span>
          Edificio {tutoria.edificio ?? '—'} · Aula {tutoria.aula ?? '—'}
        </span>
      </div>

      {tutoria.temas?.length ? (
        <div className="ex-temas">
          {tutoria.temas.map((tema, index) => (
            <span key={tema.idTema ?? index} className="ex-tema-chip">
              {tema.tema || tema.nombre || String(tema)}
            </span>
          ))}
        </div>
      ) : null}

      <Link
        to={`/tutorado/infoTutoria/${tutoria.id}`}
        className="ex-card-cta"
      >
        Ver detalle e inscribirme →
      </Link>
    </article>
  )
}

const TutoradoHome = () => {
  const { tutorias, isLoading, error } = useTutoriasExplorar()
  const [query, setQuery] = useState('')

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tutorias
    return tutorias.filter((t) => {
      return (
        t.materia?.toLowerCase().includes(q) ||
        t.nombreTutor?.toLowerCase().includes(q)
      )
    })
  }, [tutorias, query])

  return (
    <div className="ex-page">
      <HeaderTR />

      <main className="ex-main">
        <div className="ex-header">
          <div>
            <h1>Explorar Tutorias</h1>
            <p className="ex-subtitle">
              Encuentra una tutoria disponible e inscribete con un click.
            </p>
          </div>

          <div className="ex-search">
            <span className="ex-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="ex-search-input"
              placeholder="Buscar por materia o tutor..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {error ? <div className="ex-error">{error}</div> : null}

        {isLoading ? (
          <div className="ex-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ex-skeleton" />
            ))}
          </div>
        ) : tutorias.length === 0 && !error ? (
          <div className="ex-empty">
            <h3>No hay tutorias disponibles</h3>
            <p>Vuelve mas tarde o revisa tus inscripciones actuales.</p>
            <Link to="/tutorado/tutorias" className="ex-empty-cta">
              Ver mis tutorias
            </Link>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="ex-empty">
            <h3>Sin resultados</h3>
            <p>No encontramos tutorias que coincidan con "{query}".</p>
          </div>
        ) : (
          <>
            <p className="ex-count">
              {filtradas.length} tutoria{filtradas.length === 1 ? '' : 's'}
              {query ? ` para "${query}"` : ' disponibles'}
            </p>
            <div className="ex-grid">
              {filtradas.map((tutoria) => (
                <TutoriaCard key={tutoria.id} tutoria={tutoria} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default TutoradoHome
