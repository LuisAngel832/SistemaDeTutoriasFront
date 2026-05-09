import { Link } from 'react-router-dom'
import HeaderTR from '../../components/Tutorado/HeaderTR'
import { useTutoriasTutorado } from '../../hooks/useTutoriasTutorado'
import './misTutorias.css'

const renderCard = (item, cancelled = false) => {
  return (
    <article className={`mis-tutoria-card ${cancelled ? 'cancelled' : ''}`} key={`${item.idTutoria}-${cancelled}`}>
      <h2>{item.materia?.nombreMateria || 'Materia sin nombre'}</h2>
      <p>
        <strong>Fecha:</strong> {item.fecha}
      </p>
      <p>
        <strong>Horario:</strong> {item.horario?.horaInicio?.slice(0, 5)} -{' '}
        {item.horario?.horaFin?.slice(0, 5)}
      </p>
      <p>
        <strong>Estado:</strong> {cancelled ? 'CANCELADA' : item.estado}
      </p>

      {!cancelled ? (
        <Link to={`/tutorado/infoTutoria/${item.idTutoria}`}>
          <button type="button">Ver detalle</button>
        </Link>
      ) : null}
    </article>
  )
}

const MisTutorias = () => {
  const { tutorias, tutoriasCanceladas, isLoading, error } = useTutoriasTutorado()

  return (
    <div className="mis-tutorias-page">
      <HeaderTR />

      <main className="mis-tutorias-main">
        <h1>Mis Tutorias</h1>

        {isLoading ? <p>Cargando...</p> : null}
        {!isLoading && error ? <p className="error-text">{error}</p> : null}

        {!isLoading && !error ? (
          <>
            <section className="mis-tutorias-section">
              <h3>Activas</h3>
              {tutorias.length > 0 ? tutorias.map((item) => renderCard(item, false)) : <p>Sin tutorias activas</p>}
            </section>

            <section className="mis-tutorias-section">
              <h3>Canceladas</h3>
              {tutoriasCanceladas.length > 0
                ? tutoriasCanceladas.map((item) => renderCard(item, true))
                : <p>Sin tutorias canceladas</p>}
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

export default MisTutorias
