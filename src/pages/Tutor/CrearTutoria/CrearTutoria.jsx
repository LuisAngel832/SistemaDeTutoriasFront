import Header from '../../../components/Tutor/Header'
import VentanaEmerjente from '../../../components/Tutor/VentanaEmerjente'
import useCrearTutoria from '../../../hooks/useCrearTutoria'
import FormCrearTutoria from './FormCrearTutoria'
import './crearTutoria.css'
import './crearTutoriaR.css'

const CrearTutoria = () => {
  const {
    nrcMateria,
    setNrcMateria,
    horario,
    setHorario,
    fecha,
    setFecha,
    edificio,
    setEdificio,
    aula,
    setAula,
    mensaje,
    showModal,
    setShowModal,
    temas,
    agregarTema,
    quitarTema,
    handleSubmit,
    horariosDisponibles,
    materiasDisponibles,
    isSubmitting,
  } = useCrearTutoria()

  const handleLimpiar = () => {
    setNrcMateria('')
    setHorario('')
    setFecha('')
    setEdificio('')
    setAula('')
    ;[...temas].forEach((t) => quitarTema(t))
  }

  return (
    <div className="crear-tutoria-page">
      <Header />

      {showModal ? (
        <VentanaEmerjente
          text={mensaje}
          textBtn1="Aceptar"
          handleClickBtn1={() => setShowModal(false)}
        />
      ) : null}

      <section className="main-crear-tutoria">
        <div className="crear-tutoria-content">
          <div className="crear-tutoria-header">
            <h2>
              <span className="crear-tutoria-icon" aria-hidden="true">+</span>
              Crear Tutoria
            </h2>
            <p className="crear-tutoria-subtitle">
              Programa una nueva sesion para tus tutorados.
            </p>
          </div>

          <FormCrearTutoria
            nrcMateria={nrcMateria}
            setNrcMateria={setNrcMateria}
            horario={horario}
            setHorario={setHorario}
            fecha={fecha}
            setFecha={setFecha}
            edificio={edificio}
            setEdificio={setEdificio}
            aula={aula}
            setAula={setAula}
            horariosDisponibles={horariosDisponibles}
            materiasDisponibles={materiasDisponibles}
            temas={temas}
            agregarTema={agregarTema}
            quitarTema={quitarTema}
          />

          <div className="crear-actions">
            <button
              type="button"
              className="btn-secundario"
              onClick={handleLimpiar}
              disabled={isSubmitting}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="btn-aceptar"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                'Crear Tutoria'
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CrearTutoria
