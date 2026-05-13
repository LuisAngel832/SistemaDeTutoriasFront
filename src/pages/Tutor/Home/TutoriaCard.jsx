const FALLBACK = '—'

const formatHora = (hora) => (typeof hora === 'string' ? hora.slice(0, 5) : FALLBACK)

const TutoriaCard = ({ tutoria }) => {
  const { estado, aula, edificio, horario, materia } = tutoria

  return (
    <article className="tutoria-card" data-testid="tutoria-card">
      <header className="tutoria-card-header">
        <h3 className="tutoria-card-materia">
          {materia?.nombreMateria || 'Materia sin nombre'}
        </h3>
        <span className={`tutoria-card-estado estado-${(estado || 'desconocido').toLowerCase()}`}>
          {estado || FALLBACK}
        </span>
      </header>

      <dl className="tutoria-card-grid">
        <div className="tutoria-card-item">
          <dt>Hora</dt>
          <dd>{formatHora(horario?.horaInicio)}</dd>
        </div>
        <div className="tutoria-card-item">
          <dt>NRC</dt>
          <dd>{materia?.nrc || FALLBACK}</dd>
        </div>
        <div className="tutoria-card-item">
          <dt>Aula</dt>
          <dd>{aula || FALLBACK}</dd>
        </div>
        <div className="tutoria-card-item">
          <dt>Edificio</dt>
          <dd>{edificio || FALLBACK}</dd>
        </div>
      </dl>
    </article>
  )
}

export default TutoriaCard
