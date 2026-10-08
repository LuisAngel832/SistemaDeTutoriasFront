import { IconCheck, IconCruz } from '@/components/ui/icons'
import { clases } from '@/utils/clases'
import styles from './MarcaAsistencia.module.css'

// Control "Asistió / No asistió" de un tutorado (pantalla 12). Son radios nativos: se usan con
// flechas y Tab. `valor`: true | false | null (sin marca).
export const MarcaAsistencia = ({ nombre, matricula, valor, disabled = false, onCambiar }) => {
  const name = `asistencia-${matricula}`
  const opciones = [
    { valor: true, texto: 'Asistió', Icono: IconCheck, clase: styles.asistio },
    { valor: false, texto: 'No asistió', Icono: IconCruz, clase: styles.falto },
  ]

  return (
    <fieldset className={styles.grupo} disabled={disabled}>
      <legend className={styles.oculto}>Asistencia de {nombre}</legend>
      {opciones.map(({ valor: opcion, texto, Icono, clase }) => {
        const activa = valor === opcion
        return (
          <label key={texto} className={clases(styles.opcion, activa && clase)}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              checked={activa}
              onChange={() => onCambiar(opcion)}
            />
            {activa ? <Icono /> : null}
            {texto}
          </label>
        )
      })}
    </fieldset>
  )
}

// Marca fija para una lista cerrada.
export const MarcaFija = ({ valor }) => {
  if (valor === true) {
    return (
      <span className={clases(styles.fija, styles.textoAsistio)}>
        <IconCheck /> Asistió
      </span>
    )
  }
  if (valor === false) {
    return (
      <span className={clases(styles.fija, styles.textoFalto)}>
        <IconCruz /> No asistió
      </span>
    )
  }
  return <span className={styles.fija}>Sin marca</span>
}
