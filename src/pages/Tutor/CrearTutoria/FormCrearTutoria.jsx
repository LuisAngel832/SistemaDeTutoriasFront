const FormCrearTutoria = ({
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
  horariosDisponibles,
}) => {
  return (
    <form className="crear-tutoria-form" onSubmit={(event) => event.preventDefault()}>
      <div className="input-group">
        <label htmlFor="nrc-materia" className="crear-tutoria-label">
          NRC de Materia
        </label>
        <input
          type="number"
          className="crear-tutoria-input"
          id="nrc-materia"
          placeholder="NRC"
          required
          value={nrcMateria}
          onChange={(event) => setNrcMateria(event.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="horario" className="crear-tutoria-label">
          Horario
        </label>
        <select
          className="crear-tutoria-input select"
          id="horario"
          onChange={(event) => setHorario(event.target.value)}
          value={horario}
          required
        >
          <option value="">Selecciona tu horario</option>
          {horariosDisponibles.map((h) => (
            <option key={h.idHorario} value={h.idHorario}>
              {h.horaInicio} - {h.horaFin} - {h.dia}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="fecha" className="crear-tutoria-label">
          Fecha
        </label>
        <input
          type="date"
          className="crear-tutoria-input"
          id="fecha"
          required
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="edificio" className="crear-tutoria-label">
          Edificio
        </label>
        <select
          className="crear-tutoria-input select"
          id="edificio"
          value={edificio}
          onChange={(event) => setEdificio(event.target.value)}
          required
        >
          <option value="">Selecciona el edificio</option>
          <option value="1">Edificio 1</option>
          <option value="2">Edificio 2</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="aula" className="crear-tutoria-label">
          Aula
        </label>
        <select
          className="crear-tutoria-input select"
          id="aula"
          value={aula}
          onChange={(event) => setAula(event.target.value)}
          required
        >
          <option value="">Selecciona el aula</option>
          {Array.from({ length: 16 }, (_, index) => {
            const number = index + 1
            return (
              <option key={number} value={number}>
                Aula {number}
              </option>
            )
          })}
        </select>
      </div>
    </form>
  )
}

export default FormCrearTutoria
