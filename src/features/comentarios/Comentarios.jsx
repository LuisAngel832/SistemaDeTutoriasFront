import { useId, useState } from 'react'
import { Alert, Button, EmptyState, Textarea } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { useComentarios } from './useComentarios'
import { avisar } from '@/utils/avisos'
import { getInicial } from '@/utils/formatters'
import styles from './Comentarios.module.css'

// Comentarios de una tutoria (RF15).
// modo: lectura (solo ver) | tutorado (puede publicar y borrar sus comentarios)
export const Comentarios = ({ idTutoria, modo = 'lectura', maxLength = 280 }) => {
  const { comentarios, isLoading, error, crear, eliminar } = useComentarios(idTutoria)
  const { matricula } = useAuth()
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
            Tema u observación que quieres compartir con el tutor
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
        <ul className={styles.lista}>
          {comentarios.map((comentario) => {
            const esMio = comentario.matricula != null && comentario.matricula === matricula
            const autor = comentario.nombre || comentario.matricula || 'Tutorado'

            return (
              <li key={comentario.idComentario} className={styles.comentario}>
                <span className={styles.avatar} aria-hidden="true">
                  {getInicial(autor)}
                </span>
                <div className={styles.cuerpo}>
                  <p className={styles.autor}>
                    {autor}
                    {esMio ? <span className={styles.propio}>Tu</span> : null}
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
