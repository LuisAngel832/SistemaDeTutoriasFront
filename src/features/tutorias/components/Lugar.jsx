import { IconEdificio } from '@/components/ui/icons'
import { clases } from '@/utils/clases'
import { formatLugar } from '@/utils/formatters'
import styles from './Lugar.module.css'

// "Edificio 2 · Aula 7" con el icono de edificio.
export const Lugar = ({ edificio, aula, className }) => (
  <p className={clases(styles.lugar, className)}>
    <span className={styles.icono} aria-hidden="true">
      <IconEdificio />
    </span>
    {formatLugar(edificio, aula)}
  </p>
)
