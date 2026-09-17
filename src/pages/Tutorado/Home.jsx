import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EncabezadoPagina, GridTarjetas, Pagina } from '../../components/layout/Pagina'
import { Alert, Button, EmptyState, Input, Skeleton } from '../../components/ui'
import { IconBuscar } from '../../components/ui/icons'
import { ROUTES } from '../../constants/routes'
import { TutoriaCard } from '../../features/tutorias/components/TutoriaCard'
import { useTutoriasExplorar } from '../../hooks/useTutoriasExplorar'
import styles from './Home.module.css'

const TutoradoHome = () => {
  const { tutorias, isLoading, error } = useTutoriasExplorar()
  const [busqueda, setBusqueda] = useState('')

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return tutorias
    return tutorias.filter(
      (tutoria) =>
        tutoria.materia?.toLowerCase().includes(texto) ||
        tutoria.nombreTutor?.toLowerCase().includes(texto),
    )
  }, [tutorias, busqueda])

  const buscador = (
    <div className={styles.buscador}>
      <span className={styles.icono} aria-hidden="true">
        <IconBuscar />
      </span>
      <Input
        type="search"
        id="buscar-tutoria"
        className={styles.campo}
        aria-label="Buscar tutorias por Experiencia Educativa o por nombre del tutor"
        placeholder="Buscar por Experiencia Educativa o nombre del tutor..."
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
      />
    </div>
  )

  return (
    <Pagina aria-busy={isLoading}>
      <EncabezadoPagina
        title="Explorar Tutorias"
        subtitle="Encuentra una tutoria disponible e inscribete con un click."
        action={buscador}
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
          title="No hay tutorias disponibles"
          description="Vuelve mas tarde o revisa tus inscripciones actuales."
          action={
            <Button as={Link} to={ROUTES.tutorado.inscripciones} variant="brand">
              Ver mis tutorias
            </Button>
          }
        />
      ) : filtradas.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={`No encontramos tutorias que coincidan con "${busqueda}".`}
        />
      ) : (
        <>
          <p className={styles.conteo} role="status">
            {filtradas.length} tutoria{filtradas.length === 1 ? '' : 's'}
            {busqueda ? ` para "${busqueda}"` : ' disponibles'}
          </p>
          <GridTarjetas>
            {filtradas.map((tutoria) => (
              <TutoriaCard
                key={tutoria.id}
                tutoria={tutoria}
                variant="explorar"
                to={ROUTES.tutorado.detalle(tutoria.id)}
              />
            ))}
          </GridTarjetas>
        </>
      )}
    </Pagina>
  )
}

export default TutoradoHome
