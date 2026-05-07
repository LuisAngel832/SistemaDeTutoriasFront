import { Link } from 'react-router-dom'

const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate()

const buildDaysWithTutorias = (tutorias, month, year) => {
  return tutorias.reduce((accumulator, tutoria) => {
    const fecha = new Date(tutoria.fecha)

    if (fecha.getMonth() + 1 !== month || fecha.getFullYear() !== year) {
      return accumulator
    }

    const day = fecha.getDate()
    if (!accumulator[day]) {
      accumulator[day] = []
    }

    accumulator[day].push(tutoria)
    return accumulator
  }, {})
}

const Calendario = ({ month, year, tutorias = [] }) => {
  const daysInMonth = getDaysInMonth(month, year)
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)

  const monthName = new Date(year, month - 1).toLocaleString('es-MX', {
    month: 'long',
  })

  const daysWithTutorias = buildDaysWithTutorias(tutorias, month, year)

  return (
    <div className="calendario-container">
      <h2 className="calendario-header">
        {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
      </h2>

      <div className="calendario-grid">
        {days.map((day, index) => {
          const tutoriasDelDia = daysWithTutorias[day] || []

          const contenido = (
            <div
              className={`calendario-dia ${
                tutoriasDelDia.length > 0 ? 'tutoria-tutorado' : index % 2 === 0 ? 'verde' : 'azul'
              }`}
            >
              <strong>{day}</strong>
              {tutoriasDelDia.map((tutoria) => (
                <div
                  key={tutoria.idTutoria}
                  className="tutoria-info"
                  title={`NRC: ${tutoria.materia?.nrc}`}
                >
                  {tutoria.materia?.nombreMateria || `NRC: ${tutoria.materia?.nrc}`}
                </div>
              ))}
            </div>
          )

          if (tutoriasDelDia.length > 0) {
            return (
              <Link
                key={`link-${day}`}
                to={`/tutorado/infoTutoria/${tutoriasDelDia[0].idTutoria}`}
                className="link"
              >
                {contenido}
              </Link>
            )
          }

          return <div key={`day-${day}`}>{contenido}</div>
        })}
      </div>
    </div>
  )
}

export default Calendario
