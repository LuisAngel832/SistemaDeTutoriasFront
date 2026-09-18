import { useId, useState } from 'react'
import { Button, Card, ConfirmDialog } from '../../../components/ui'
import { MIN_MINUTOS_CANCELACION } from '../../../constants/tutoria'
import { esProgramada } from '../../../utils/tutoria'
import styles from './AccionesTutoria.module.css'

// Acciones del tutor sobre una tutoria programada, con confirmacion.
// onCompletar / onCancelar son async; el resultado lo muestra la pantalla.
export const AccionesTutoria = ({
  tutoria,
  puedeCompletar,
  puedeCancelar,
  isSubmitting,
  onCompletar,
  onCancelar,
}) => {
  const [confirmando, setConfirmando] = useState(null)
  const idTitulo = useId()
  const idPistaCompletar = useId()
  const idPistaCancelar = useId()

  if (!esProgramada(tutoria)) {
    return (
      <Card as="section" padding="lg" aria-labelledby={idTitulo}>
        <h2 className={styles.titulo} id={idTitulo}>
          Estado
        </h2>
        <p className={styles.texto}>
          Esta tutoría está {tutoria.estado?.toLowerCase() || 'finalizada'}. Ya no se pueden hacer
          cambios.
        </p>
      </Card>
    )
  }

  const confirmar = async () => {
    const accion = confirmando === 'completar' ? onCompletar : onCancelar
    await accion()
    setConfirmando(null)
  }

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <h2 className={styles.titulo} id={idTitulo}>
        Acciones
      </h2>

      <div className={styles.acciones}>
        <Button
          fullWidth
          onClick={() => setConfirmando('completar')}
          disabled={isSubmitting || !puedeCompletar}
          aria-describedby={puedeCompletar ? undefined : idPistaCompletar}
        >
          Marcar como completada
        </Button>
        {puedeCompletar ? null : (
          <p className={styles.pista} id={idPistaCompletar}>
            Podrás marcarla como completada cuando inicie la sesión.
          </p>
        )}

        <Button
          variant="danger-outline"
          fullWidth
          onClick={() => setConfirmando('cancelar')}
          disabled={isSubmitting || !puedeCancelar}
          aria-describedby={puedeCancelar ? undefined : idPistaCancelar}
        >
          Cancelar tutoría
        </Button>
        {puedeCancelar ? null : (
          <p className={styles.pista} id={idPistaCancelar}>
            Solo puedes cancelar con más de {MIN_MINUTOS_CANCELACION} minutos de anticipación.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmando === 'completar'}
        title="Marcar como completada"
        description="Confirma que la tutoría ya se impartió. Después ya no podrás editarla."
        confirmLabel="Sí, completar"
        loading={isSubmitting}
        onConfirm={confirmar}
        onCancel={() => setConfirmando(null)}
      />
      <ConfirmDialog
        open={confirmando === 'cancelar'}
        tone="danger"
        title="Cancelar tutoría"
        description="Los inscritos serán notificados por correo. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        loading={isSubmitting}
        onConfirm={confirmar}
        onCancel={() => setConfirmando(null)}
      />
    </Card>
  )
}
