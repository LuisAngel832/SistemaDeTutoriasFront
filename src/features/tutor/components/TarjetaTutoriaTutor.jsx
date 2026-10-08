import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { IconAlerta } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { BadgeEstado } from '@/features/tutorias/components/BadgeEstado'
import { BarraCupo } from '@/features/tutorias/components/BarraCupo'
import { HorariosSemana } from '@/features/tutorias/components/HorariosSemana'
import { Lugar } from '@/features/tutorias/components/Lugar'
import { formatCuando, pluralizar } from '@/utils/formatters'
import styles from './TarjetaTutoriaTutor.module.css'

// Una tutoria del tutor en "Tus tutorías" (pantalla 09).
export const TarjetaTutoriaTutor = ({ tutoria }) => {
  const idTitulo = useId()
  const enRiesgo = tutoria.tutoradosEnRiesgo ?? 0

  return (
    <Card as="article" className={styles.tarjeta} aria-labelledby={idTitulo}>
      <div className={styles.encabezado}>
        <h3 className={styles.titulo} id={idTitulo}>
          {tutoria.materia?.nombre}
        </h3>
        <BadgeEstado tipo="tutoria" estado={tutoria.estado} />
      </div>
      <p className={styles.nrc}>NRC {tutoria.materia?.nrc}</p>
      <HorariosSemana horarios={tutoria.horarios} />
      <Lugar edificio={tutoria.edificio} aula={tutoria.aula} />
      <BarraCupo cupo={tutoria.cupo} etiqueta="Inscritos" />

      {enRiesgo ? (
        <p className={styles.riesgo}>
          <IconAlerta />
          {enRiesgo === 1
            ? '1 tutorado ya tiene 2 inasistencias'
            : `${pluralizar(enRiesgo, 'tutorado')} ya tienen 2 inasistencias`}
        </p>
      ) : tutoria.proximaSesion ? (
        <p className={styles.proxima}>
          Próxima sesión:{' '}
          {formatCuando(tutoria.proximaSesion.fecha, tutoria.proximaSesion.horaInicio)}
        </p>
      ) : null}

      <Link
        to={ROUTES.tutor.detalle(tutoria.idTutoria)}
        className={styles.enlace}
        aria-describedby={idTitulo}
      >
        Ver detalle <span aria-hidden="true">→</span>
      </Link>
    </Card>
  )
}
