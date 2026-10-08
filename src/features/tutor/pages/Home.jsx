import { Link } from 'react-router-dom'
import { EncabezadoPagina, GridTarjetas, Pagina } from '@/components/layout/Pagina'
import { Alert, Button, EmptyState, Skeleton } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { TutoriaCard } from '@/features/tutorias/components/TutoriaCard'
import { useMisTutorias } from '@/features/tutorias/hooks/useMisTutorias'

const TutorHome = () => {
  const { tutorias, isLoading, error } = useMisTutorias()

  return (
    <Pagina aria-busy={isLoading}>
      <EncabezadoPagina
        title="Mis tutorías"
        subtitle="Tutorías que has creado y su estado actual."
        action={
          <Button as={Link} to={ROUTES.tutor.nuevaTutoria}>
            + Crear tutoría
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {isLoading ? (
        <GridTarjetas>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </GridTarjetas>
      ) : tutorias.length === 0 && !error ? (
        <EmptyState
          title="Aún no tienes tutorías"
          description="Crea tu primera tutoría para que tus tutorados puedan inscribirse."
          action={
            <Button as={Link} to={ROUTES.tutor.nuevaTutoria}>
              + Crear mi primera tutoría
            </Button>
          }
        />
      ) : (
        <GridTarjetas>
          {tutorias.map((tutoria) => (
            <TutoriaCard key={tutoria.id} tutoria={tutoria} to={ROUTES.tutor.detalle(tutoria.id)} />
          ))}
        </GridTarjetas>
      )}
    </Pagina>
  )
}

export default TutorHome
