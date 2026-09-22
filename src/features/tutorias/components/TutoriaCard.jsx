import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Button, Chip } from '@/components/ui'
import { clases } from '@/utils/clases'
import { formatFecha, formatRangoHora, formatTema, SIN_DATO } from '@/utils/formatters'
import { EstadoBadge } from './EstadoBadge'
import styles from './TutoriaCard.module.css'

const SIN_NOMBRE = 'Experiencia Educativa sin nombre'

const TEXTO_ACCION = {
  explorar: 'Ver detalle e inscribirme',
  inscripcion: 'Ver detalle',
}

// Tarjeta de una tutoria en los listados.
// variant:
//   tutor       -> toda la tarjeta enlaza al detalle (Mis tutorias del tutor)
//   explorar    -> boton para ver el detalle e inscribirse
//   inscripcion -> boton para ver el detalle de una inscripcion del tutorado
export const TutoriaCard = ({ tutoria, to, variant = 'tutor', headingLevel = 'h2' }) => {
  const idTitulo = useId()
  const Titulo = headingLevel
  const materia = tutoria.materia || SIN_NOMBRE

  if (variant === 'inscripcion' && !tutoria.materia && !tutoria.fecha) {
    return (
      <article className={clases(styles.card, styles.incompleta)}>
        <p className={styles.incompletaTitulo}>Inscripción sin detalles</p>
        <p className={styles.incompletaTexto}>No se pudo obtener la información de esta tutoría.</p>
      </article>
    )
  }

  const mostrarLugar = tutoria.edificio != null || tutoria.aula != null
  const temas = variant === 'inscripcion' ? [] : (tutoria.temas ?? [])

  return (
    <article
      className={clases(styles.card, variant === 'tutor' && styles.enlazada)}
      aria-labelledby={idTitulo}
    >
      <div className={styles.encabezado}>
        <div className={styles.titulos}>
          <Titulo className={styles.titulo} id={idTitulo}>
            {variant === 'tutor' && to ? (
              <Link to={to} className={styles.enlaceTarjeta}>
                {materia}
              </Link>
            ) : (
              materia
            )}
          </Titulo>
          {tutoria.nombreTutor ? (
            <p className={styles.tutor}>
              {variant === 'tutor' ? tutoria.nombreTutor : `Imparte ${tutoria.nombreTutor}`}
            </p>
          ) : null}
        </div>
        {tutoria.estado || variant !== 'inscripcion' ? (
          <EstadoBadge estado={tutoria.estado} />
        ) : null}
      </div>

      <dl className={styles.info}>
        <dt>Fecha</dt>
        <dd>{formatFecha(tutoria.fecha)}</dd>
        <dt>Horario</dt>
        <dd>{formatRangoHora(tutoria.horaInicio, tutoria.horaFin)}</dd>
        {mostrarLugar ? (
          <>
            <dt>Lugar</dt>
            <dd>
              Edificio {tutoria.edificio ?? SIN_DATO} · Aula {tutoria.aula ?? SIN_DATO}
            </dd>
          </>
        ) : null}
      </dl>

      {temas.length ? (
        <ul className={styles.temas} aria-label="Temas">
          {temas.map((tema, indice) => (
            <li key={tema.idTema ?? `${formatTema(tema)}-${indice}`}>
              <Chip>{formatTema(tema)}</Chip>
            </li>
          ))}
        </ul>
      ) : null}

      {variant === 'tutor' ? (
        <span className={styles.pista} aria-hidden="true">
          Ver detalle →
        </span>
      ) : to ? (
        <Button
          as={Link}
          to={to}
          variant={variant === 'explorar' ? 'primary' : 'brand'}
          fullWidth
          className={styles.accion}
          aria-describedby={idTitulo}
        >
          {TEXTO_ACCION[variant]}
          <span aria-hidden="true">→</span>
        </Button>
      ) : null}
    </article>
  )
}
