import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { IconAlerta } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { BarraCupo } from '@/features/tutorias/components/BarraCupo'
import { HorariosSemana } from '@/features/tutorias/components/HorariosSemana'
import { Lugar } from '@/features/tutorias/components/Lugar'
import { describirChoqueCorto } from '@/utils/choques'
import { estaLlena, etiquetaLugares } from '@/utils/cupo'
import styles from './TarjetaExplorar.module.css'

// Tarjeta de una tutoria en Explorar (pantalla 03). `desde` es la busqueda actual, para que
// "Volver a explorar" conserve los filtros.
export const TarjetaExplorar = ({ tutoria, desde }) => {
  const idTitulo = useId()
  const lugares = etiquetaLugares(tutoria.cupo)
  const choques = tutoria.choques ?? []
  const disponible = !estaLlena(tutoria.cupo) && choques.length === 0

  return (
    <Card as="article" className={styles.tarjeta} aria-labelledby={idTitulo}>
      <div className={styles.encabezado}>
        <h2 className={styles.titulo} id={idTitulo}>
          {tutoria.materia?.nombre}
        </h2>
        <Badge tone={lugares.tone}>{lugares.texto}</Badge>
      </div>
      <p className={styles.tutor}>Imparte {tutoria.tutor?.nombreCompleto}</p>

      <HorariosSemana horarios={tutoria.horarios} diasConChoque={choques.map((c) => c.dia)} />
      <Lugar edificio={tutoria.edificio} aula={tutoria.aula} />
      <BarraCupo cupo={tutoria.cupo} />

      {choques.length ? (
        <p className={styles.choque}>
          <IconAlerta />
          <span>
            <strong>Se cruza con tu horario.</strong> {choques.map(describirChoqueCorto).join(' ')}
          </span>
        </p>
      ) : null}

      <Button
        as={Link}
        to={ROUTES.tutorado.detalle(tutoria.idTutoria)}
        state={{ desde }}
        variant={disponible ? 'primary' : 'secondary'}
        fullWidth
        className={styles.accion}
        aria-describedby={idTitulo}
      >
        {disponible ? (
          <>
            Ver detalle e inscribirme <span aria-hidden="true">→</span>
          </>
        ) : (
          'Ver detalle'
        )}
      </Button>
    </Card>
  )
}
