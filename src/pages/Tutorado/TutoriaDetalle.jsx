import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import HeaderTR from '../../components/Tutorado/HeaderTR'
import VentanaEmerjente from '../../components/Tutor/VentanaEmerjente'
import { useTutoriaDetalleTutorado } from '../../hooks/useTutoriaDetalleTutorado'
import './tutoriaDetalle.css'

const formatHour = (hour) => hour?.slice(0, 5) || 'N/D'

const TutoriaDetalle = () => {
  const { id } = useParams()
  const { tutoria, isLoading, error, isSubmitting, inscribirse, cancelarInscripcion } =
    useTutoriaDetalleTutorado(id)
  const [modalText, setModalText] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const tutoradoInscrito = useMemo(() => {
    if (!tutoria?.tutorados) {
      return false
    }

    const matricula = localStorage.getItem('matricula')
    return tutoria.tutorados.some((item) => item.matricula === matricula)
  }, [tutoria])

  const handleInscribirse = async () => {
    const message = await inscribirse()
    setModalText(message)
    setShowModal(true)
  }

  const handleConfirmCancel = async () => {
    const message = await cancelarInscripcion()
    setShowCancelModal(false)
    setModalText(message)
    setShowModal(true)
  }

  return (
    <section className="tutoria-tutorados">
      <HeaderTR />

      <div className="main-content">
        {showModal ? (
          <VentanaEmerjente
            handleClickBtn1={() => setShowModal(false)}
            text={modalText}
            textBtn1="Aceptar"
          />
        ) : null}

        {showCancelModal ? (
          <VentanaEmerjente
            handleClickBtn1={() => setShowCancelModal(false)}
            handleClickBtn2={handleConfirmCancel}
            text="Deseas cancelar tu inscripcion?"
            textBtn1="Volver"
            textBtn2="Aceptar"
          />
        ) : null}

        {isLoading ? <p>Cargando tutoria...</p> : null}
        {!isLoading && error ? <p>{error}</p> : null}

        {!isLoading && !error && tutoria ? (
          <>
            <div className="info-tutoria">
              <div className="tutoria-card">
                <p className="fondo-gris">
                  <strong>ID Tutoria:</strong> {tutoria.idTutoria}
                </p>
                <p className="fondo-gris-claro">
                  <strong>Tutor:</strong> {tutoria.horario?.tutor?.nombre || 'N/D'}
                </p>
                <p className="fondo-gris">
                  <strong>Materia:</strong> {tutoria.materia?.nombreMateria || 'N/D'}
                </p>
                <p className="fondo-gris-claro">
                  <strong>Fecha:</strong> {tutoria.fecha}
                </p>
                <p className="fondo-gris">
                  <strong>Hora:</strong> {formatHour(tutoria.horario?.horaInicio)} -{' '}
                  {formatHour(tutoria.horario?.horaFin)}
                </p>
                <p className="fondo-gris-claro">
                  <strong>Ubicacion:</strong> Edificio {tutoria.edificio}, Aula {tutoria.aula}
                </p>
              </div>
            </div>

            <div className="buttons-content">
              <button
                type="button"
                onClick={handleInscribirse}
                className="btn-inscribirse"
                disabled={isSubmitting || tutoradoInscrito}
              >
                {tutoradoInscrito ? 'Ya inscrito' : 'Inscribirse'}
              </button>

              {tutoradoInscrito ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="btn-cancelar"
                  disabled={isSubmitting}
                >
                  Cancelar Inscripcion
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default TutoriaDetalle
