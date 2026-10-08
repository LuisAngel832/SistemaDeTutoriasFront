import { Button, Modal } from '@/components/ui'
import { IconCorreo } from '@/components/ui/icons'
import { HorariosSemana } from '@/features/tutorias/components/HorariosSemana'
import { Lugar } from '@/features/tutorias/components/Lugar'
import styles from './ConfirmarInscripcion.module.css'

// Confirmacion de la inscripcion (pantalla 05).
export const ConfirmarInscripcion = ({ open, tutoria, correo, loading, onConfirmar, onCerrar }) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onCerrar}
    title="Confirmar inscripción"
    actions={
      <>
        <Button variant="secondary" onClick={onCerrar} disabled={loading}>
          Volver
        </Button>
        <Button onClick={onConfirmar} loading={loading}>
          {loading ? 'Inscribiendo…' : 'Sí, inscribirme'}
        </Button>
      </>
    }
  >
    <p className={styles.texto}>
      Te inscribirás a <strong>{tutoria.materia?.nombre}</strong> con{' '}
      {tutoria.tutor?.nombreCompleto}.
    </p>
    <div className={styles.resumen}>
      <HorariosSemana horarios={tutoria.horarios} />
      <Lugar edificio={tutoria.edificio} aula={tutoria.aula} />
    </div>
    <p className={styles.correo}>
      <IconCorreo />
      <span>
        Te llegará la confirmación{correo ? ` a ${correo}` : ' por correo'} y un recordatorio 2
        horas antes de cada sesión.
      </span>
    </p>
  </Modal>
)
