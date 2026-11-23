import { clases } from '@/utils/clases'
import styles from './AvisoDespertando.module.css'

// Explica por que el login o el registro tardan: el backend estaba dormido. La region de estado
// existe siempre (vacia y fuera de la vista) para que los lectores de pantalla anuncien el texto
// cuando aparece.
export const AvisoDespertando = ({ visible, className }) => (
  <p role="status" className={clases(styles.aviso, className)}>
    {visible
      ? 'El servidor estaba en reposo y está despertando. Puede tardar hasta un minuto; no cierres la página.'
      : null}
  </p>
)
