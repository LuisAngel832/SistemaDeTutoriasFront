import { Link } from 'react-router-dom'

const TutoriaCard = ({ tutoriaData }) => {
  const { idTutoria, estado, aula, edificio, horario, materia } = tutoriaData

  return (
    <Link to={`/tutor/tutoria/${idTutoria}`} className="link">
      <article className="card">
        <div className="card-item">
          <h4 className="card-item-title">Hora</h4>
          <p className="card-item-text-important">{horario?.horaInicio || 'N/D'}</p>
        </div>

        <div className="card-item">
          <h4 className="card-item-title">Estado</h4>
          <p className="card-item-text-important">{estado || 'N/D'}</p>
        </div>

        <div className="card-item">
          <h4 className="card-item-title">Materia</h4>
          <p className="card-item-text">{materia?.nombreMateria || 'N/D'}</p>
        </div>

        <div className="card-item">
          <h4 className="card-item-title">NRC</h4>
          <p className="card-item-text">{materia?.nrc || 'N/D'}</p>
        </div>

        <div className="card-item">
          <h4 className="card-item-title">Tutor</h4>
          <p className="card-item-text">{horario?.tutor?.nombre || 'N/D'}</p>
        </div>

        <div className="card-item">
          <h4 className="card-item-title">Aula</h4>
          <p className="card-item-text">{aula || 'N/D'}</p>
        </div>

        <div className="card-item">
          <h4 className="card-item-title">Edificio</h4>
          <p className="card-item-text">{edificio || 'N/D'}</p>
        </div>
      </article>
    </Link>
  )
}

export default TutoriaCard
