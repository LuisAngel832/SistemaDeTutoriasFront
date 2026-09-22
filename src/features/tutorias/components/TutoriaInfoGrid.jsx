import { IconCalendario, IconEdificio, IconPuerta, IconReloj } from '@/components/ui/icons'
import { formatFecha, formatRangoHora, SIN_DATO } from '@/utils/formatters'
import styles from './TutoriaInfoGrid.module.css'

// Datos principales de una tutoria en las pantallas de detalle.
export const TutoriaInfoGrid = ({ tutoria }) => {
  const datos = [
    {
      etiqueta: 'Fecha',
      valor: formatFecha(tutoria.fecha, { variant: 'larga' }),
      Icono: IconCalendario,
    },
    {
      etiqueta: 'Horario',
      valor: formatRangoHora(tutoria.horaInicio, tutoria.horaFin),
      Icono: IconReloj,
    },
    { etiqueta: 'Edificio', valor: tutoria.edificio ?? SIN_DATO, Icono: IconEdificio },
    { etiqueta: 'Aula', valor: tutoria.aula ?? SIN_DATO, Icono: IconPuerta },
  ]

  return (
    <dl className={styles.grid}>
      {datos.map(({ etiqueta, valor, Icono }) => (
        <div key={etiqueta} className={styles.item}>
          <dt className={styles.etiqueta}>
            <span className={styles.icono} aria-hidden="true">
              <Icono />
            </span>
            {etiqueta}
          </dt>
          <dd className={styles.valor}>{valor}</dd>
        </div>
      ))}
    </dl>
  )
}
