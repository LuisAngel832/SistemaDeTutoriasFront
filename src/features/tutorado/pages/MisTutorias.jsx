import { Link } from 'react-router-dom'
import { EncabezadoPagina, GridTarjetas, Pagina } from '@/components/layout/Pagina'
import { Alert, Button, EmptyState, Skeleton } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { TutoriaCard } from '@/features/tutorias/components/TutoriaCard'
import { useTutoriasTutorado } from '@/features/tutorias/hooks/useTutoriasTutorado'

const MisTutorias = () => {
  const { tutorias, isLoading, error } = useTutoriasTutorado()

  return (
    <Pagina aria-busy={isLoading}>
      <EncabezadoPagina title="Mis tutorías" subtitle="Las tutorías en las que estás inscrito." />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {isLoading ? (
        <GridTarjetas>
          <Skeleton />
          <Skeleton />
        </GridTarjetas>
      ) : tutorias.length === 0 && !error ? (
        <EmptyState
          title="Aún no tienes inscripciones"
          description="Explora las tutorías disponibles y reserva tu lugar."
          action={
            <Button as={Link} to={ROUTES.tutorado.inicio} variant="brand">
              Explorar tutorías
            </Button>
          }
        />
      ) : (
        <GridTarjetas>
          {tutorias.map((inscripcion) => (
            <TutoriaCard
              key={inscripcion.idAsistencia ?? inscripcion.idTutoria}
              tutoria={inscripcion}
              variant="inscripcion"
              to={
                inscripcion.idTutoria ? ROUTES.tutorado.detalle(inscripcion.idTutoria) : undefined
              }
            />
          ))}
        </GridTarjetas>
      )}
    </Pagina>
  )
}

export default MisTutorias
