import Calendario from './Calendario'
import { useTutoriasTutorado } from '../../../hooks/useTutoriasTutorado'

const MainContent = () => {
  const { tutorias, error, isLoading } = useTutoriasTutorado()

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  return (
    <div className="main-content-home-tutorado">
      <div className="home-tutorado">
        {isLoading ? <p>Cargando tutorias...</p> : null}
        {!isLoading && error ? <p className="error-text">Ocurrio un error: {error}</p> : null}
        {!isLoading && !error ? <Calendario month={month} year={year} tutorias={tutorias} /> : null}
      </div>
    </div>
  )
}

export default MainContent
