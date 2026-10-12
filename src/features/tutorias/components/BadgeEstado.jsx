import { Badge } from '@/components/ui'

// Texto y tono de la insignia de cada estado del backend, por tipo de recurso.
const ESTADOS = {
  tutoria: {
    ACTIVA: { texto: 'Activa', tone: 'success' },
    INACTIVA: { texto: 'Inactiva', tone: 'neutral' },
  },
  sesion: {
    PROGRAMADA: { texto: 'Programada', tone: 'info' },
    LISTA_ABIERTA: { texto: 'Lista abierta', tone: 'warning' },
    COMPLETADA: { texto: 'Completada', tone: 'success' },
    CANCELADA: { texto: 'Cancelada', tone: 'danger' },
  },
  inscripcion: {
    ACTIVA: { texto: 'Activa', tone: 'success' },
    BAJA: { texto: 'Baja', tone: 'neutral' },
    BAJA_AUTOMATICA: { texto: 'Baja automática', tone: 'danger' },
  },
}

// tipo: tutoria | sesion | inscripcion
export const BadgeEstado = ({ tipo, estado, className }) => {
  const datos = ESTADOS[tipo]?.[estado] ?? { texto: estado || 'Sin estado', tone: 'neutral' }
  return (
    <Badge tone={datos.tone} className={className}>
      {datos.texto}
    </Badge>
  )
}
