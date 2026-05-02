import { useMemo, useState } from 'react'
import VentanaEmerjente from '../../../components/Tutor/VentanaEmerjente'
import SelectHora from './SelectHora'

const BASE_URL = 'https://backtutorias.onrender.com'

const DAY_LABELS = [
  'DOMINGO',
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
]

const formatHour = (value) => value.toString().padStart(2, '0')

const AgregarHorarioForm = () => {
  const [fecha, setFecha] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [minutosInicio, setMinutosInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [minutosFin, setMinutosFin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('')

  const propsHora = useMemo(
    () => ({
      horaInicio,
      setHoraInicio,
      minutosInicio,
      setMinutosInicio,
      horaFin,
      setHoraFin,
      minutosFin,
      setMinutosFin,
    }),
    [horaInicio, minutosInicio, horaFin, minutosFin],
  )

  const camposIncompletos =
    !fecha ||
    horaInicio === '' ||
    minutosInicio === '' ||
    horaFin === '' ||
    minutosFin === ''

  const inicioMinutos = Number(horaInicio) * 60 + Number(minutosInicio)
  const finMinutos = Number(horaFin) * 60 + Number(minutosFin)

  const isHorarioValido = finMinutos > inicioMinutos

  const toggleModal = () => setShowModal((prev) => !prev)

  const handleAgregarHorario = async () => {
    if (camposIncompletos) {
      setModalText('Completa todos los campos')
      setShowModal(true)
      return
    }

    if (!isHorarioValido) {
      setModalText('La hora final debe ser mayor que la hora de inicio')
      setShowModal(true)
      return
    }

    const selectedDate = new Date(`${fecha}T00:00:00`)
    const dia = DAY_LABELS[selectedDate.getDay()]

    const horario = {
      dia,
      horaInicio: `${formatHour(Number(horaInicio))}:${formatHour(Number(minutosInicio))}`,
      horaFin: `${formatHour(Number(horaFin))}:${formatHour(Number(minutosFin))}`,
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${BASE_URL}/horarios/crear-horario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(horario),
      })

      const data = await response.json()

      if (response.ok) {
        setModalText('Horario agregado con exito')
        setFecha('')
        setHoraInicio('')
        setMinutosInicio('')
        setHoraFin('')
        setMinutosFin('')
      } else {
        setModalText(`Error al agregar horario: ${data?.message || 'Error desconocido'}`)
      }

      setShowModal(true)
    } catch {
      setModalText('Error al conectar con el servidor, intentalo mas tarde')
      setShowModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {showModal ? (
        <VentanaEmerjente
          text={modalText}
          textBtn1="Aceptar"
          handleClickBtn1={toggleModal}
        />
      ) : null}

      <section className="main-agregar-horario">
        <section className="content-horario">
          <h2>Agregar Horario</h2>

          <div className="main-horario-content">
            <div className="select-fecha">
              <label htmlFor="fecha-horario">Fecha</label>
              <input
                id="fecha-horario"
                type="date"
                className="fecha-input"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>

            <div className="select-hora-min">
              <SelectHora title="Hora de Inicio" value="inicio" {...propsHora} />
              <SelectHora title="Hora Final" value="fin" {...propsHora} />
            </div>
          </div>

          <div className="button-content">
            <button
              type="button"
              className="btn-aceptar"
              onClick={handleAgregarHorario}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Agregar Horario'}
            </button>
          </div>
        </section>
      </section>
    </>
  )
}

export default AgregarHorarioForm
