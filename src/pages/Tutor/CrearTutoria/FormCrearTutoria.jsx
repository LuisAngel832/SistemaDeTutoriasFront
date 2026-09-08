import { Link } from 'react-router-dom'
import TemasInput from '../../../components/Tutor/TemasInput'

const FormCrearTutoria = ({
  nrcExperiencia,
  setNrcExperiencia,
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
  experienciasDisponibles,
}) => {
  const sinHorarios = horariosDisponibles.length === 0
  const sinExperiencias = experienciasDisponibles.length === 0
  const hoy = new Date().toISOString().split('T')[0]

  return (
    <form className="crear-tutoria-form" onSubmit={(event) => event.preventDefault()}>
      <div className="input-group">
        <label htmlFor="nrc-experiencia" className="crear-tutoria-label">
          Experiencia Educativa que impartiras
        </label>
        <div className="select-wrapper">
          <select
            className="crear-tutoria-input select"
            id="nrc-experiencia"
            value={nrcExperiencia}
            onChange={(event) => setNrcExperiencia(event.target.value)}
            required
            disabled={sinExperiencias}
          >
            <option value="">
              {sinExperiencias
                ? 'No hay experiencias educativas registradas'
                : 'Selecciona la Experiencia Educativa'}
            </option>
            {experienciasDisponibles.map((m) => (
              <option key={m.nrc} value={m.nrc}>
                {m.materia} (NRC {m.nrc})
              </option>
            ))}
          </select>
        </div>
        {sinExperiencias ? (
          <p className="empty-horarios">
            No hay experiencias educativas disponibles. Pide a un administrador que las registre.
          </p>
        ) : null}
      </div>

      <div className="input-group">
        <label htmlFor="horario" className="crear-tutoria-label">
          Horario en el que daras la tutoria
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
            Primero <Link to="/tutor/agregar-horario">crea un horario</Link> para
            poder crear una tutoria.
          </p>
        ) : null}
      </div>

      <div className="input-group">
        <label htmlFor="fecha" className="crear-tutoria-label">
          Fecha en que se dara la tutoria
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
          Edificio donde se dara la tutoria
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
          Aula donde se dara la tutoria
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
        <label htmlFor="tema-nuevo" className="crear-tutoria-label">
          Temas a tratar durante la tutoria (opcional)
        </label>
        <TemasInput
          inputId="tema-nuevo"
          temas={temas}
          onAdd={agregarTema}
          onRemove={quitarTema}
        />
      </div>
    </form>
  )
}

export default FormCrearTutoria
