import { useTutorias } from '../../../hooks/useTutorias'
import TutoriaCard from './TutoriaCard'

const TutoriasBox = () => {
  const { tutorias, isLoading, error } = useTutorias()

  return (
    <section className="tutorias-box">
      <h3 className="tutoria-title">Tutorias</h3>

      {isLoading ? <p>Cargando tutorias...</p> : null}
      {!isLoading && error ? <p>{error}</p> : null}

      {!isLoading && !error ? (
        <div className="contenedorTarjetasTotorias">
          {tutorias.length > 0 ? (
            tutorias.map((tutoria) => (
              <TutoriaCard key={tutoria.idTutoria} tutoriaData={tutoria} />
            ))
          ) : (
            <p>No hay tutorias disponibles.</p>
          )}
        </div>
      ) : null}
    </section>
  )
}

export default TutoriasBox
