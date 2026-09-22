import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Card, Chip, Skeleton } from '@/components/ui'
import { formatTema } from '@/utils/formatters'
import { EstadoBadge } from './EstadoBadge'
import styles from './DetalleTutoria.module.css'

const SIN_NOMBRE = 'Experiencia Educativa sin nombre'

// Piezas compartidas por el detalle de tutoria del tutor y del tutorado.

// back: enlace o boton para volver.
export const DetalleTutoriaLayout = ({ back, main, aside, footer }) => (
  <>
    <div className={styles.volver}>{back}</div>
    <div className={styles.grid}>
      <Card as="article" padding="lg" className={styles.principal}>
        {main}
      </Card>
      <aside className={styles.lateral}>{aside}</aside>
    </div>
    {footer}
  </>
)

export const EncabezadoTutoria = ({ tutoria }) => (
  <header className={styles.encabezado}>
    <div className={styles.titulos}>
      <h1 className={styles.titulo}>{tutoria.materia || SIN_NOMBRE}</h1>
      {tutoria.nombreTutor ? (
        <p className={styles.tutor}>
          <span className={styles.tutorEtiqueta}>Imparte</span> {tutoria.nombreTutor}
        </p>
      ) : null}
    </div>
    <EstadoBadge estado={tutoria.estado} />
  </header>
)

export const SeccionTutoria = ({ title, description, children }) => {
  const idTitulo = useId()
  return (
    <section className={styles.seccion} aria-labelledby={idTitulo}>
      <h2 className={styles.seccionTitulo} id={idTitulo}>
        {title}
      </h2>
      {description ? <p className={styles.seccionDescripcion}>{description}</p> : null}
      {children}
    </section>
  )
}

export const ListaTemas = ({ temas = [], emptyMessage = 'No se registraron temas.' }) =>
  temas.length ? (
    <ul className={styles.temas}>
      {temas.map((tema, indice) => (
        <li key={tema.idTema ?? `${formatTema(tema)}-${indice}`}>
          <Chip tone="primary">{formatTema(tema)}</Chip>
        </li>
      ))}
    </ul>
  ) : (
    <p className={styles.sinTemas}>{emptyMessage}</p>
  )

export const DetalleCargando = ({ back }) => (
  <>
    <div className={styles.volver}>{back}</div>
    <div className={styles.grid} aria-busy="true">
      <Skeleton height={360} className={styles.skeleton} />
      <Skeleton height={260} className={styles.skeleton} />
    </div>
  </>
)

export const DetalleError = ({ message, to, linkLabel }) => (
  <Alert tone="error" className={styles.error}>
    {message}
    <Link to={to} className={styles.errorEnlace}>
      {linkLabel}
    </Link>
  </Alert>
)
