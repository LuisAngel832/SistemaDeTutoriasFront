import { useState } from 'react'
import { Chip, Input } from '@/components/ui'
import { IconMas } from '@/components/ui/icons'
import { MAX_CARACTERES_TEMA, MAX_TEMAS } from '@/constants/tutoria'
import { formatDiaNombre, formatRangoHora, ordenarHorarios } from '@/utils/formatters'
import styles from './HorariosYTemas.module.css'

// Horarios de la tutoria con los temas de cada uno (los tutorados ven los temas "del martes" en
// las sesiones del martes). Con `editable`, el tutor agrega y quita temas en linea; las
// funciones reciben el horario y devuelven { ok, message }.
export const HorariosYTemas = ({
  horarios = [],
  editable = false,
  onAgregarTema,
  onQuitarTema,
  ocupado = false,
}) => (
  <ul className={styles.lista}>
    {ordenarHorarios(horarios).map((horario) => {
      const temas = horario.temas ?? []
      const dia = formatDiaNombre(horario.dia)
      return (
        <li key={horario.idHorario ?? horario.dia} className={styles.fila}>
          <div className={styles.cuando}>
            <span className={styles.dia}>{dia}</span>
            <span className={styles.horas}>
              {formatRangoHora(horario.horaInicio, horario.horaFin)}
            </span>
          </div>

          <div className={styles.contenido}>
            {temas.length ? (
              <ul className={styles.temas} aria-label={`Temas del ${dia.toLowerCase()}`}>
                {temas.map((tema) => (
                  <li key={tema.idTema ?? tema.tema}>
                    <Chip
                      tone="primary"
                      disabled={ocupado}
                      removeLabel={`Quitar el tema ${tema.tema}`}
                      onRemove={editable ? () => onQuitarTema(tema, horario) : undefined}
                    >
                      {tema.tema}
                    </Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.sinTemas}>Sin temas para este horario.</p>
            )}

            {editable ? (
              <NuevoTema
                dia={dia}
                lleno={temas.length >= MAX_TEMAS}
                ocupado={ocupado}
                onAgregar={(texto) => onAgregarTema(horario, texto)}
              />
            ) : null}
          </div>
        </li>
      )
    })}
  </ul>
)

const NuevoTema = ({ dia, lleno, ocupado, onAgregar }) => {
  const [texto, setTexto] = useState('')
  const limpio = texto.trim()

  const agregar = async (evento) => {
    evento.preventDefault()
    if (!limpio) return
    const res = await onAgregar(limpio)
    if (res?.ok) setTexto('')
  }

  return (
    <form className={styles.nuevo} onSubmit={agregar}>
      <Input
        aria-label={`Tema nuevo para el ${dia.toLowerCase()}`}
        placeholder={
          lleno ? `Máximo ${MAX_TEMAS} temas` : `Tema nuevo para el ${dia.toLowerCase()}`
        }
        value={texto}
        maxLength={MAX_CARACTERES_TEMA}
        disabled={lleno || ocupado}
        onChange={(evento) => setTexto(evento.target.value)}
      />
      <button
        type="submit"
        className={styles.agregar}
        disabled={!limpio || lleno || ocupado}
        aria-label={`Agregar tema al ${dia.toLowerCase()}`}
      >
        <IconMas />
      </button>
    </form>
  )
}
