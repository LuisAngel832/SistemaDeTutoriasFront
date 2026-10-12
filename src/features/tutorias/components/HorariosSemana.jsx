import { buscarDia } from '@/constants/horarios'
import { clases } from '@/utils/clases'
import { formatDiaCorto, formatRangoHora, ordenarHorarios } from '@/utils/formatters'
import styles from './HorariosSemana.module.css'

// Horarios semanales en filas: chip del dia ("LUN") y su horario. Los dias con choque se
// resaltan en ambar (`diasConChoque`: lista de dias del backend).
export const HorariosSemana = ({ horarios = [], diasConChoque = [], className }) => (
  <ul className={clases(styles.lista, className)}>
    {ordenarHorarios(horarios).map((horario) => (
      <li key={horario.idHorario ?? `${horario.dia}-${horario.horaInicio}`} className={styles.fila}>
        <ChipDia dia={horario.dia} choque={diasConChoque.includes(horario.dia)} />
        <span>{formatRangoHora(horario.horaInicio, horario.horaFin)}</span>
      </li>
    ))}
  </ul>
)

// "LUN" con el nombre completo para lectores de pantalla.
export const ChipDia = ({ dia, choque = false, className }) => (
  <span className={clases(styles.chip, choque && styles.choque, className)}>
    <span aria-hidden="true">{formatDiaCorto(dia)}</span>
    <span className={styles.oculto}>{buscarDia(dia)?.nombre ?? dia}</span>
  </span>
)
