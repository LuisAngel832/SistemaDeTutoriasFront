import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EncabezadoPagina, GridTarjetas, Pagina } from '@/components/layout/Pagina'
import { Alert, Button, EmptyState, Skeleton } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { TutoriaCard } from '@/features/tutorias/components/TutoriaCard'
import { useMisTutorias } from '@/features/tutorias/hooks/useMisTutorias'

const TutorHome = () => {
  const { tutorias, isLoading, error } = useMisTutorias()
  const { matricula, actualizarNombre } = useAuth()

  // El login no devuelve el nombre del tutor, pero si viene en sus tutorias:
  // lo guardamos para poder mostrarlo en la tarjeta del sidebar.
  // (Un admin ve tutorias de otros tutores, asi que solo aplica si todas son del mismo.)
  useEffect(() => {
    const nombres = new Set(tutorias.map((tutoria) => tutoria.nombreTutor).filter(Boolean))
    if (matricula && nombres.size === 1) actualizarNombre([...nombres][0])
  }, [tutorias, matricula, actualizarNombre])

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
