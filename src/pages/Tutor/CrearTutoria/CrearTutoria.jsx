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
    handleSubmit,
    horariosDisponibles,
    isSubmitting,
  } = useCrearTutoria()

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
          <h2>Crear Tutoria</h2>

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
          />

          <div className="crear-actions">
            <button type="button" className="btn-aceptar" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear Tutoria'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CrearTutoria
