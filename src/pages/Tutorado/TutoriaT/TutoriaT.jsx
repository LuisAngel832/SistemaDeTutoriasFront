import { useParams } from 'react-router-dom'
import HeaderTR from '../../../components/Tutorado/HeaderTR'

const TutoriaT = () => {
  const { id } = useParams()

  return (
    <div className="home-T">
      <HeaderTR />
      <main className="home-role">
        <h1>Detalle de Tutoria</h1>
        <p>Tutoria seleccionada: {id}</p>
      </main>
    </div>
  )
}

export default TutoriaT
