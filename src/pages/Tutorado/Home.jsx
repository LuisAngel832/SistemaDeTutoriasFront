import { Link } from 'react-router-dom'
import HeaderTR from '../../components/Tutorado/HeaderTR'
import { useTutoriasExplorar } from '../../hooks/useTutoriasExplorar'
import './homeTutorado.css'

const formatHour = (hour) => hour?.slice(0, 5) || 'N/D'

const TutoradoHome = () => {
  const { tutorias, isLoading, error } = useTutoriasExplorar()

  return (
    <div className="home-tutorado-page">
      <HeaderTR />

      <main className="main-content-tutorias">
        <h1>Explorar Tutorias</h1>

        {isLoading ? <p>Cargando tutorias...</p> : null}
        {!isLoading && error ? <p className="error-text">{error}</p> : null}

        {!isLoading && !error ? (
          tutorias.length > 0 ? (
            tutorias.map((tutoria) => {
              const cupos = 5 - (tutoria.tutorados?.length || 0)
              return (
                <article key={tutoria.idTutoria} className="card-tutoria-content">
                  <h2>{tutoria.materia?.nombreMateria || 'Materia sin nombre'}</h2>

                  <div className="card-info-tutoria">
                    <p>Nombre Tutor: {tutoria.horario?.tutor?.nombre || 'N/D'}</p>
                    <p>
                      {tutoria.fecha}, <span>{formatHour(tutoria.horario?.horaInicio)}</span> -
                      <span> {formatHour(tutoria.horario?.horaFin)}</span> hrs
                    </p>
                    <p>Cupos Disponibles: {cupos}</p>
                  </div>

                  <Link to={`/tutorado/infoTutoria/${tutoria.idTutoria}`}>
                    <button type="button">Inscribirse</button>
                  </Link>
                </article>
              )
            })
          ) : (
            <p>No hay tutorias activas</p>
          )
        ) : null}
      </main>
    </div>
  )
}

export default TutoradoHome
