import { useId } from 'react'
import { Badge, Card } from '@/components/ui'
import { DIAS_HABILES } from '@/constants/horarios'
import { clases } from '@/utils/clases'
import { formatRangoHora } from '@/utils/formatters'
import styles from './TuSemana.module.css'

// "Tu semana" (pantalla 04): las inscripciones activas del tutorado junto a los horarios de la
// tutoria que esta viendo. Los choques ya vienen calculados por el backend.
export const TuSemana = ({ tutoria, semana = [] }) => {
  const idTitulo = useId()
  const choques = tutoria.panelTutorado?.choques ?? []
  const chocaCon = (dia, idTutoria) =>
    choques.some((c) => c.dia === dia && String(c.conTutoria?.idTutoria) === String(idTutoria))
  const choqueDeEsta = (dia) => choques.some((c) => c.dia === dia)

  // Si ya esta inscrito, la tutoria tambien viene en su semana: se muestra una sola vez.
  const otras = semana.filter((item) => String(item.idTutoria) !== String(tutoria.idTutoria))
  const entradas = [
    ...otras.map((item) => ({
      clave: `${item.idTutoria}-${item.dia}-${item.horaInicio}`,
      dia: item.dia,
      horaInicio: item.horaInicio,
      texto: `${formatRangoHora(item.horaInicio, item.horaFin)} · ${item.materia}`,
      tipo: chocaCon(item.dia, item.idTutoria) ? 'choque' : 'otra',
    })),
    ...(tutoria.horarios ?? []).map((horario) => ({
      clave: `esta-${horario.idHorario ?? horario.dia}`,
      dia: horario.dia,
      horaInicio: horario.horaInicio,
      texto: `${formatRangoHora(horario.horaInicio, horario.horaFin)} · Esta tutoría`,
      tipo: choqueDeEsta(horario.dia) ? 'choque' : 'esta',
    })),
  ]

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <div className={styles.encabezado}>
        <h2 className={styles.titulo} id={idTitulo}>
          Tu semana
        </h2>
        {choques.length ? (
          <Badge tone="danger">Choque</Badge>
        ) : (
          <Badge tone="success">✓ Sin choques</Badge>
        )}
      </div>
      <p className={styles.descripcion}>
        Tus inscripciones activas junto a los horarios de esta tutoría.
      </p>

      <dl className={styles.dias}>
        {DIAS_HABILES.map((dia) => {
          const delDia = entradas
            .filter((entrada) => entrada.dia === dia.key)
            .sort((a, b) => String(a.horaInicio).localeCompare(String(b.horaInicio)))
          return (
            <div key={dia.key} className={styles.dia}>
              <dt className={styles.nombre} style={{ gridRow: `span ${delDia.length || 1}` }}>
                <abbr title={dia.nombre}>{dia.corto}</abbr>
              </dt>
              {delDia.length ? (
                delDia.map((entrada) => (
                  <dd key={entrada.clave} className={clases(styles.entrada, styles[entrada.tipo])}>
                    {entrada.texto}
                  </dd>
                ))
              ) : (
                <dd className={clases(styles.entrada, styles.libre)}>Libre</dd>
              )}
            </div>
          )
        })}
      </dl>
    </Card>
  )
}
