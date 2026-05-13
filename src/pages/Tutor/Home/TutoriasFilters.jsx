import { ESTADOS } from './filterTutorias'

const TutoriasFilters = ({ search, estado, onSearchChange, onEstadoChange }) => {
  return (
    <div className="tutorias-filters" role="search">
      <label className="tutorias-filter">
        <span className="tutorias-filter-label">Buscar materia</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Ej. Cálculo"
          aria-label="Buscar tutoria por materia"
        />
      </label>

      <label className="tutorias-filter">
        <span className="tutorias-filter-label">Estado</span>
        <select
          value={estado}
          onChange={(event) => onEstadoChange(event.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos</option>
          {ESTADOS.map((value) => (
            <option key={value} value={value}>
              {value.replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default TutoriasFilters
