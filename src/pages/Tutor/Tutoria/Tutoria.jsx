import { useParams } from 'react-router-dom'

const Tutoria = () => {
  const { id } = useParams()

  return (
    <main className="home-role">
      <h1>Tutoria {id}</h1>
      <p>Vista de detalle en construccion.</p>
    </main>
  )
}

export default Tutoria
