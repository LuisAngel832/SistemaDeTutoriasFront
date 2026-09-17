import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../features/auth/AuthContext'
import useMisTutorias from '../../hooks/useMisTutorias'
import { formatFecha, formatRangoHora, formatTema, SIN_DATO } from '../../utils/formatters'
import { getEstadoClass } from '../../utils/tutoria'
import './home.css'

const TutoriaCard = ({ tutoria }) => {
  const estadoClass = getEstadoClass(tutoria.estado)

  return (
    <Link to={ROUTES.tutor.detalle(tutoria.id)} className="tutoria-card-link">
      <article className="tutoria-card">
        <div className="tutoria-card-top">
          <div>
            <h3 className="tutoria-experiencia">
              {tutoria.materia || 'Experiencia Educativa sin nombre'}
            </h3>
            {tutoria.nombreTutor ? <p className="tutoria-tutor">{tutoria.nombreTutor}</p> : null}
          </div>
          <span className={`tutoria-estado ${estadoClass}`}>{tutoria.estado || 'SIN ESTADO'}</span>
        </div>

        <div className="tutoria-info">
          <span className="tutoria-info-label">Fecha:</span>
          <span>{formatFecha(tutoria.fecha)}</span>

          <span className="tutoria-info-label">Horario:</span>
          <span>{formatRangoHora(tutoria.horaInicio, tutoria.horaFin)}</span>

          <span className="tutoria-info-label">Lugar:</span>
          <span>
            Edificio {tutoria.edificio ?? SIN_DATO} · Aula {tutoria.aula ?? SIN_DATO}
          </span>
        </div>

        {tutoria.temas?.length ? (
          <div className="tutoria-temas">
            {tutoria.temas.map((tema, index) => (
              <span key={tema.idTema ?? index} className="tutoria-tema-chip">
                {formatTema(tema)}
              </span>
            ))}
          </div>
        ) : null}

        <span className="tutoria-card-hint">Ver detalle →</span>
      </article>
    </Link>
  )
}

const TutorHome = () => {
  const { tutorias, isLoading, error } = useMisTutorias()
  const { matricula, actualizarNombre } = useAuth()

  // El login no devuelve el nombre del tutor, pero si viene en sus tutorias:
  // lo guardamos para poder mostrarlo en la tarjeta del sidebar.
  // (Un admin ve tutorias de otros tutores, asi que solo aplica si todas son del mismo.)
  useEffect(() => {
    const nombres = new Set(tutorias.map((tutoria) => tutoria.nombreTutor).filter(Boolean))
    if (matricula && nombres.size === 1) actualizarNombre([...nombres][0])
  }, [tutorias, matricula, actualizarNombre])

  return (
    <main className="tutor-home-main">
      <div className="tutor-home-header">
        <div>
          <h1>Mis Tutorias</h1>
          <p className="tutor-home-subtitle">Tutorias que has creado y su estado actual.</p>
        </div>
        <Link to={ROUTES.tutor.nuevaTutoria} className="btn-primary-link">
          + Crear Tutoria
        </Link>
      </div>

      {error ? <div className="tutorias-error">{error}</div> : null}

      {isLoading ? (
        <div className="tutorias-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="tutoria-skeleton" />
          ))}
        </div>
      ) : tutorias.length === 0 && !error ? (
        <div className="tutorias-empty">
          <h3>Aun no tienes tutorias</h3>
          <p>Crea tu primera tutoria para que tus tutorados puedan inscribirse.</p>
          <Link to={ROUTES.tutor.nuevaTutoria} className="btn-primary-link">
            + Crear mi primera tutoria
          </Link>
        </div>
      ) : (
        <div className="tutorias-grid">
          {tutorias.map((tutoria) => (
            <TutoriaCard key={tutoria.id} tutoria={tutoria} />
          ))}
        </div>
      )}
    </main>
  )
}

export default TutorHome
