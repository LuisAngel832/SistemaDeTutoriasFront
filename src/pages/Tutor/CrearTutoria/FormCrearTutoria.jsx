import { Link } from 'react-router-dom'
import TemasInput from '../../../components/Tutor/TemasInput'

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
  temas,
  agregarTema,
  quitarTema,
  horariosDisponibles,
  materiasDisponibles,
}) => {
  const sinHorarios = horariosDisponibles.length === 0
  const sinMaterias = materiasDisponibles.length === 0
  const hoy = new Date().toISOString().split('T')[0]

  return (
    <form className="crear-tutoria-form" onSubmit={(event) => event.preventDefault()}>
      <div className="input-group">
        <label htmlFor="nrc-materia" className="crear-tutoria-label">
          Materia
        </label>
        <div className="select-wrapper">
          <select
            className="crear-tutoria-input select"
            id="nrc-materia"
            value={nrcMateria}
            onChange={(event) => setNrcMateria(event.target.value)}
            required
            disabled={sinMaterias}
          >
            <option value="">
              {sinMaterias ? 'No hay materias registradas' : 'Selecciona la materia'}
            </option>
            {materiasDisponibles.map((m) => (
              <option key={m.nrc} value={m.nrc}>
                {m.materia} (NRC {m.nrc})
              </option>
            ))}
          </select>
        </div>
        {sinMaterias ? (
          <p className="empty-horarios">
            No hay materias disponibles. Pide a un administrador que las registre.
          </p>
        ) : null}
      </div>

      <div className="input-group">
        <label htmlFor="horario" className="crear-tutoria-label">
          Horario
        </label>
        <div className="select-wrapper">
          <select
            className="crear-tutoria-input select"
            id="horario"
            onChange={(event) => setHorario(event.target.value)}
            value={horario}
            required
            disabled={sinHorarios}
          >
            <option value="">
              {sinHorarios ? 'No tienes horarios disponibles' : 'Selecciona tu horario'}
            </option>
            {horariosDisponibles.map((h) => (
              <option key={h.idHorario} value={h.idHorario}>
                {h.dia} · {h.horaInicio?.slice(0, 5)} - {h.horaFin?.slice(0, 5)}
              </option>
            ))}
          </select>
        </div>
        {sinHorarios ? (
          <p className="empty-horarios">
            Primero <Link to="/tutor/agregar-horario">agrega un horario</Link> para
            poder crear una tutoria.
          </p>
        ) : null}
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
          min={hoy}
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="edificio" className="crear-tutoria-label">
          Edificio
        </label>
        <div className="select-wrapper">
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
      </div>

      <div className="input-group full">
        <label htmlFor="aula" className="crear-tutoria-label">
          Aula
        </label>
        <div className="select-wrapper">
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
      </div>

      <div className="input-group full">
        <label className="crear-tutoria-label">Temas a tratar</label>
        <TemasInput temas={temas} onAdd={agregarTema} onRemove={quitarTema} />
      </div>
    </form>
  )
}

export default FormCrearTutoria
