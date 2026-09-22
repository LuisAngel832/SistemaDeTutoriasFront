import { Badge } from '@/components/ui'
import { ESTADOS_TUTORIA } from '@/constants/tutoria'
import { normalizarEstado } from '@/utils/tutoria'

const PRESENTACION = {
  [ESTADOS_TUTORIA.PROGRAMADA]: { tono: 'info', texto: 'Programada' },
  [ESTADOS_TUTORIA.COMPLETADA]: { tono: 'success', texto: 'Completada' },
  [ESTADOS_TUTORIA.CANCELADA]: { tono: 'danger', texto: 'Cancelada' },
}

export const EstadoBadge = ({ estado, className }) => {
  const presentacion = PRESENTACION[normalizarEstado(estado)]
  return (
    <Badge tone={presentacion?.tono ?? 'neutral'} className={className}>
      {presentacion?.texto ?? (estado || 'Sin estado')}
    </Badge>
  )
}
