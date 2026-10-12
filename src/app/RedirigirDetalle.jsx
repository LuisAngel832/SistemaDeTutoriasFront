import { Navigate, useParams } from 'react-router-dom'

// Mantiene funcionando los enlaces con las URLs anteriores a la reorganizacion de rutas.
export const RedirigirDetalle = ({ destino }) => {
  const { id } = useParams()
  return <Navigate to={destino(id)} replace />
}
