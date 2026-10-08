import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { clavesUsuario } from '@/api/queryKeys'
import { usuariosApi } from '@/api/usuarios'
import { useAuth } from './AuthContext'

// Mantiene al dia el nombre y el correo de la barra lateral con GET /usuarios/me.
export const useUsuarioActual = () => {
  const { isAuthenticated, sincronizarUsuario } = useAuth()

  const { data } = useQuery({
    queryKey: clavesUsuario.actual(),
    queryFn: ({ signal }) => usuariosApi.actual({ signal }),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (data && !Array.isArray(data)) sincronizarUsuario(data)
  }, [data, sincronizarUsuario])
}
