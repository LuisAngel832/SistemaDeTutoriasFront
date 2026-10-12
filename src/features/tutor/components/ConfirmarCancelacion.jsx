import { ConfirmDialog } from '@/components/ui'
import { formatFechaLarga, formatRangoHora, pluralizar } from '@/utils/formatters'

// Confirmacion para cancelar una sesion programada (RN-8). `sesion` es null cuando esta cerrada.
export const ConfirmarCancelacion = ({ sesion, loading, onConfirmar, onCerrar }) => (
  <ConfirmDialog
    open={Boolean(sesion)}
    tone="danger"
    title="¿Cancelar la sesión?"
    description={
      sesion
        ? `${sesion.materia} · ${formatFechaLarga(sesion.fecha, { mayuscula: false })} · ${formatRangoHora(sesion.horaInicio, sesion.horaFin)}. Avisaremos por correo a ${sesion.inscritos ? `los ${pluralizar(sesion.inscritos, 'tutorado')}` : 'los tutorados inscritos'} y la sesión no contará para inasistencias. No se puede deshacer.`
        : ''
    }
    confirmLabel="Sí, cancelar sesión"
    cancelLabel="Volver"
    loading={loading}
    onConfirm={onConfirmar}
    onCancel={onCerrar}
  />
)
