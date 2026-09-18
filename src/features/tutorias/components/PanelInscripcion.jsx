import { useId, useState } from 'react'
import { Alert, Button, Card, ConfirmDialog } from '../../../components/ui'
import { MIN_MINUTOS_CANCELACION } from '../../../constants/tutoria'
import { formatTiempoRestante } from '../../../utils/fechas'
import { esProgramada } from '../../../utils/tutoria'
import styles from './PanelInscripcion.module.css'

// Inscripcion del tutorado a una tutoria, con las reglas de tiempo del backend.
export const PanelInscripcion = ({
  tutoria,
  inscripcion,
  minutosRestantes,
  isSubmitting,
  onInscribirse,
  onCancelar,
}) => {
  const [resultado, setResultado] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const idTitulo = useId()

  const inscrito = Boolean(inscripcion)
  const yaComenzo = minutosRestantes != null && minutosRestantes <= 0
  const tardeParaCancelar = minutosRestantes != null && minutosRestantes <= MIN_MINUTOS_CANCELACION
  const noAceptaInscripciones = !esProgramada(tutoria)
  const tiempo =
    minutosRestantes != null && minutosRestantes >= 0
      ? formatTiempoRestante(minutosRestantes)
      : null

  const ejecutar = async (accion) => {
    setResultado(null)
    const res = await accion()
    setResultado({ tone: res.ok ? 'success' : 'error', texto: res.message })
    setConfirmando(false)
  }

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <h2 className={styles.titulo} id={idTitulo}>
        {inscrito ? 'Tu inscripción' : 'Inscribirse'}
      </h2>

      {resultado ? <Alert tone={resultado.tone}>{resultado.texto}</Alert> : null}

      {inscrito ? (
        <>
          <div className={styles.estado}>
            <span className={styles.punto} aria-hidden="true" />
            <div>
              <strong>Estás inscrito</strong>
              <span>{tiempo ? `La tutoría ${tiempo}.` : 'Te esperamos en la sesión.'}</span>
            </div>
          </div>

          {yaComenzo ? (
            <Alert tone="info" compact>
              La tutoría ya comenzó. Ya no es posible cancelar.
            </Alert>
          ) : tardeParaCancelar ? (
            <Alert tone="warning" compact>
              Solo puedes cancelar con más de {MIN_MINUTOS_CANCELACION} minutos de anticipación.
            </Alert>
          ) : (
            <Button
              variant="danger-outline"
              fullWidth
              onClick={() => setConfirmando(true)}
              disabled={isSubmitting}
            >
              Cancelar inscripción
            </Button>
          )}
        </>
      ) : (
        <>
          <p className={styles.descripcion}>
            {noAceptaInscripciones
              ? 'Esta tutoría ya no acepta inscripciones.'
              : yaComenzo
                ? 'La tutoría ya comenzó, no es posible inscribirse.'
                : `Al inscribirte recibirás una confirmación por correo y verás esta tutoría en tu lista${
                    tiempo ? ` (${tiempo})` : ''
                  }.`}
          </p>
          <Button
            fullWidth
            loading={isSubmitting}
            disabled={noAceptaInscripciones || yaComenzo}
            onClick={() => ejecutar(onInscribirse)}
          >
            {isSubmitting ? 'Inscribiendo…' : 'Inscribirme'}
          </Button>
        </>
      )}

      <ConfirmDialog
        open={confirmando}
        tone="danger"
        title="Cancelar inscripción"
        description="Perderás tu lugar en esta tutoría. Puedes volver a inscribirte si quedan lugares."
        confirmLabel="Sí, cancelar"
        cancelLabel="Mantener"
        loading={isSubmitting}
        onConfirm={() => ejecutar(onCancelar)}
        onCancel={() => setConfirmando(false)}
      />
    </Card>
  )
}
