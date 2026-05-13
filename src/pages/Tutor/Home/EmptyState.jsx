import { Link } from 'react-router-dom'

const EmptyState = () => {
  return (
    <div className="tutor-home-empty" role="status">
      <h2>Aún no tienes tutorías</h2>
      <p>Crea tu primera tutoría para empezar a recibir inscripciones.</p>
      <Link to="/tutor/crear" className="tutor-home-empty-cta">
        Crear tutoría
      </Link>
    </div>
  )
}

export default EmptyState
