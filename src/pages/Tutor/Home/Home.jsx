import { useMemo, useState } from 'react'
import Header from '../../../components/Tutor/Header'
import TutoriaCard from './TutoriaCard'
import TutoriasFilters from './TutoriasFilters'
import { filterTutorias } from './filterTutorias'
import { useTutoriasTutor } from '../../../hooks/useTutoriasTutor'
import './home.css'
import './homeR.css'

const TutorHome = () => {
  const { tutorias, isLoading, error } = useTutoriasTutor()
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')

  const filtered = useMemo(
    () => filterTutorias(tutorias, { search, estado }),
    [tutorias, search, estado],
  )

  const hasActiveFilters = Boolean(search.trim() || estado)
  const ready = !isLoading && !error

  return (
    <div className="tutor-home">
      <Header />

      <main className="tutor-home-main">
        <h1 className="tutor-home-title">Mis Tutorías</h1>

        {ready && tutorias.length > 0 ? (
          <TutoriasFilters
            search={search}
            estado={estado}
            onSearchChange={setSearch}
            onEstadoChange={setEstado}
          />
        ) : null}

        {isLoading ? <p className="tutor-home-state">Cargando tutorías...</p> : null}

        {!isLoading && error ? (
          <p className="tutor-home-state tutor-home-error" role="alert">
            {error}
          </p>
        ) : null}

        {ready ? (
          <section className="tutor-home-grid" aria-label="Listado de tutorías">
            {filtered.length > 0 ? (
              filtered.map((tutoria) => (
                <TutoriaCard key={tutoria.idTutoria} tutoria={tutoria} />
              ))
            ) : (
              <p className="tutor-home-state">
                {tutorias.length === 0
                  ? 'No hay tutorías para mostrar.'
                  : hasActiveFilters
                    ? 'Ninguna tutoría coincide con los filtros.'
                    : 'No hay tutorías para mostrar.'}
              </p>
            )}
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default TutorHome
