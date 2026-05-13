import { useMemo, useState } from 'react'
import Header from '../../../components/Tutor/Header'
import TutoriaCard from './TutoriaCard'
import TutoriasFilters from './TutoriasFilters'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import { filterTutorias } from './filterTutorias'
import { useTutoriasTutor } from '../../../hooks/useTutoriasTutor'
import './home.css'
import './homeR.css'

const TutorHome = () => {
  const { tutorias, isLoading, error, refetch } = useTutoriasTutor()
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')

  const filtered = useMemo(
    () => filterTutorias(tutorias, { search, estado }),
    [tutorias, search, estado],
  )

  const hasActiveFilters = Boolean(search.trim() || estado)
  const ready = !isLoading && !error
  const showFilters = ready && tutorias.length > 0

  return (
    <div className="tutor-home">
      <Header />

      <main className="tutor-home-main">
        <h1 className="tutor-home-title">Mis Tutorías</h1>

        {showFilters ? (
          <TutoriasFilters
            search={search}
            estado={estado}
            onSearchChange={setSearch}
            onEstadoChange={setEstado}
          />
        ) : null}

        {isLoading ? <p className="tutor-home-state">Cargando tutorías...</p> : null}

        {!isLoading && error ? <ErrorState message={error} onRetry={refetch} /> : null}

        {ready ? (
          tutorias.length === 0 ? (
            <EmptyState />
          ) : (
            <section className="tutor-home-grid" aria-label="Listado de tutorías">
              {filtered.length > 0 ? (
                filtered.map((tutoria) => (
                  <TutoriaCard key={tutoria.idTutoria} tutoria={tutoria} />
                ))
              ) : (
                <p className="tutor-home-state">
                  {hasActiveFilters
                    ? 'Ninguna tutoría coincide con los filtros.'
                    : 'No hay tutorías para mostrar.'}
                </p>
              )}
            </section>
          )
        ) : null}
      </main>
    </div>
  )
}

export default TutorHome
