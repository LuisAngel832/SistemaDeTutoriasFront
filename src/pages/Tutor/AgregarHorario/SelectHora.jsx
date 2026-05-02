const parseAndClamp = (value, max) => {
  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return ''
  }

  if (parsed < 0) {
    return 0
  }

  if (parsed > max) {
    return max
  }

  return parsed
}

const SelectHora = ({
  title,
  value,
  horaInicio,
  setHoraInicio,
  minutosInicio,
  setMinutosInicio,
  horaFin,
  setHoraFin,
  minutosFin,
  setMinutosFin,
}) => {
  const setters = {
    inicio: {
      setHora: setHoraInicio,
      setMin: setMinutosInicio,
      hora: horaInicio,
      minutos: minutosInicio,
    },
    fin: {
      setHora: setHoraFin,
      setMin: setMinutosFin,
      hora: horaFin,
      minutos: minutosFin,
    },
  }

  const { setHora, setMin, hora, minutos } = setters[value]

  return (
    <section className="select-hora">
      <h2 className="select-hora-title">{title}</h2>

      <div className="select-hora-content">
        <div className="select-hora-input-content">
          <input
            type="number"
            className="select-hora-input"
            min={0}
            max={23}
            value={hora}
            onChange={(event) => setHora(parseAndClamp(event.target.value, 23))}
            name={`${value}-hora`}
          />
          <p className="select-hora-input-text">hora</p>
        </div>

        <p className="select-hora-puntos">:</p>

        <div className="select-hora-input-content">
          <input
            type="number"
            className="select-hora-input"
            min={0}
            max={59}
            value={minutos}
            onChange={(event) => setMin(parseAndClamp(event.target.value, 59))}
            name={`${value}-minutos`}
          />
          <p className="select-hora-input-text">minutos</p>
        </div>

        <div className="select-hora-am-pm">
          <p>HRS</p>
        </div>
      </div>
    </section>
  )
}

export default SelectHora
