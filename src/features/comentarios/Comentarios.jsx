import { useId, useState } from 'react'
import { Alert, Avatar, Button, EmptyState, Textarea } from '@/components/ui'
import { MAX_CARACTERES_COMENTARIO } from '@/constants/tutoria'
import { useComentarios } from './useComentarios'
import { avisar } from '@/utils/avisos'
import { clases } from '@/utils/clases'
import styles from './Comentarios.module.css'

// Comentarios y sugerencias de los tutorados de una tutoria (RN-16).
// modo: lectura (solo ver) | tutorado (puede publicar y borrar sus comentarios)
// columnas: muestra los comentarios en rejilla (detalle del tutor).
export const Comentarios = ({
  idTutoria,
  modo = 'lectura',
  columnas = false,
  maxLength = MAX_CARACTERES_COMENTARIO,
}) => {
  const { comentarios, isLoading, error, crear, eliminar } = useComentarios(idTutoria)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)
  const idCampo = useId()
  const idContador = useId()

  const puedeEscribir = modo === 'tutorado'

  const publicar = async (evento) => {
    evento.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    const res = await crear(texto)
    setEnviando(false)
    if (res.ok) setTexto('')
    avisar(res)
  }

  const borrar = async (idComentario) => {
    setEliminandoId(idComentario)
    const res = await eliminar(idComentario)
    setEliminandoId(null)
    avisar(res)
  }

  return (
    <div className={styles.comentarios}>
      {puedeEscribir ? (
        <form className={styles.formulario} onSubmit={publicar}>
          <label htmlFor={idCampo} className={styles.etiqueta}>
            Tema u observación para el tutor
          </label>
          <Textarea
            id={idCampo}
            placeholder="Sugiere un tema o deja una observación para el tutor…"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            maxLength={maxLength}
            rows={3}
            disabled={enviando}
            aria-describedby={idContador}
          />
          <div className={styles.pieFormulario}>
            <span className={styles.contador} id={idContador}>
              {texto.length}/{maxLength} caracteres
            </span>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              loading={enviando}
              disabled={!texto.trim()}
            >
              {enviando ? 'Publicando…' : 'Publicar comentario'}
            </Button>
          </div>
        </form>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}

      {isLoading ? (
        <EmptyState compact description="Cargando comentarios…" />
      ) : comentarios.length === 0 ? (
        <EmptyState
          compact
          description={
            puedeEscribir
              ? 'Aún no hay comentarios. Sé el primero en sugerir un tema.'
              : 'Aún no hay comentarios de los tutorados.'
          }
        />
      ) : (
        <ul className={clases(styles.lista, columnas && styles.columnas)}>
          {comentarios.map((comentario) => {
            const esMio = Boolean(comentario.esMio)
            const autor = comentario.nombreCompleto || comentario.matricula || 'Tutorado'

            return (
              <li key={comentario.idComentario} className={styles.comentario}>
                <Avatar nombre={autor} una />
                <div className={styles.cuerpo}>
                  <p className={styles.autor}>
                    {autor}
                    {esMio ? <span className={styles.propio}>Tú</span> : null}
                  </p>
                  <p className={styles.texto}>{comentario.comentario}</p>
                </div>

                {esMio && puedeEscribir ? (
                  <button
                    type="button"
                    className={styles.borrar}
                    onClick={() => borrar(comentario.idComentario)}
                    disabled={eliminandoId === comentario.idComentario}
                    aria-label="Eliminar mi comentario"
                    title="Eliminar mi comentario"
                  >
                    <span aria-hidden="true">
                      {eliminandoId === comentario.idComentario ? '…' : '×'}
                    </span>
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
