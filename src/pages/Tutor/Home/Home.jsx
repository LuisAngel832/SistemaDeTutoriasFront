import Header from '../../../components/Tutor/Header'
import TutoriaCard from './TutoriaCard'
import { useTutoriasTutor } from '../../../hooks/useTutoriasTutor'
import './home.css'
import './homeR.css'

const TutorHome = () => {
  const { tutorias, isLoading, error } = useTutoriasTutor()

  return (
    <div className="tutor-home">
      <Header />

      <main className="tutor-home-main">
        <h1 className="tutor-home-title">Mis Tutorías</h1>

        {isLoading ? <p className="tutor-home-state">Cargando tutorías...</p> : null}

        {!isLoading && error ? (
          <p className="tutor-home-state tutor-home-error" role="alert">
            {error}
          </p>
        ) : null}

        {!isLoading && !error ? (
          <section className="tutor-home-grid" aria-label="Listado de tutorías">
            {tutorias.length > 0 ? (
              tutorias.map((tutoria) => (
                <TutoriaCard key={tutoria.idTutoria} tutoria={tutoria} />
              ))
            ) : (
              <p className="tutor-home-state">No hay tutorías para mostrar.</p>
            )}
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default TutorHome
