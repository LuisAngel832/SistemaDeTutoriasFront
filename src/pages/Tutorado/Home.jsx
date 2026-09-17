import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useTutoriasExplorar } from '../../hooks/useTutoriasExplorar'
import { formatFecha, formatRangoHora, formatTema, SIN_DATO } from '../../utils/formatters'
import { getEstadoClass } from '../../utils/tutoria'
import './homeTutorado.css'

const TutoriaCard = ({ tutoria }) => {
  const estadoClass = getEstadoClass(tutoria.estado)

  return (
    <article className="ex-card">
      <div className="ex-card-top">
        <div className="ex-card-titles">
          <h3 className="ex-experiencia">
            {tutoria.materia || 'Experiencia Educativa sin nombre'}
          </h3>
          {tutoria.nombreTutor ? <p className="ex-tutor">Imparte {tutoria.nombreTutor}</p> : null}
        </div>
        <span className={`ex-estado ${estadoClass}`}>{tutoria.estado || 'SIN ESTADO'}</span>
      </div>

      <div className="ex-info">
        <span className="ex-info-label">Fecha</span>
        <span>{formatFecha(tutoria.fecha)}</span>

        <span className="ex-info-label">Horario</span>
        <span>{formatRangoHora(tutoria.horaInicio, tutoria.horaFin)}</span>

        <span className="ex-info-label">Lugar</span>
        <span>
          Edificio {tutoria.edificio ?? SIN_DATO} · Aula {tutoria.aula ?? SIN_DATO}
        </span>
      </div>

      {tutoria.temas?.length ? (
        <div className="ex-temas">
          {tutoria.temas.map((tema, index) => (
            <span key={tema.idTema ?? index} className="ex-tema-chip">
              {formatTema(tema)}
            </span>
          ))}
        </div>
      ) : null}

      <Link to={ROUTES.tutorado.detalle(tutoria.id)} className="ex-card-cta">
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
      return t.materia?.toLowerCase().includes(q) || t.nombreTutor?.toLowerCase().includes(q)
    })
  }, [tutorias, query])

  return (
    <main className="ex-main">
      <div className="ex-header">
        <div>
          <h1>Explorar Tutorias</h1>
          <p className="ex-subtitle">Encuentra una tutoria disponible e inscribete con un click.</p>
        </div>

        <div className="ex-search">
          <span className="ex-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            id="buscar-tutoria"
            className="ex-search-input"
            aria-label="Buscar tutorias por Experiencia Educativa o por nombre del tutor"
            placeholder="Buscar por Experiencia Educativa o nombre del tutor..."
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
          <Link to={ROUTES.tutorado.inscripciones} className="ex-empty-cta">
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
  )
}

export default TutoradoHome
