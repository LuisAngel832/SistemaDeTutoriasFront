import { useCallback, useEffect, useRef, useState } from 'react'
import { esCancelacion } from '../api/client'

// Carga datos del backend al montar y cuando cambia `cargador`.
// - Cancela la peticion en curso al desmontar o al volver a cargar.
// - `recargar` muestra el estado de carga; `refrescar` actualiza sin parpadeo
//   (se usa despues de una mutacion).
// `cargador` debe ser estable (funcion de modulo o envuelta en useCallback) y recibir { signal }.
export const useRecurso = (cargador, valorInicial) => {
  const [datos, setDatos] = useState(valorInicial)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const controllerRef = useRef(null)

  // El estado solo se actualiza en los callbacks de la promesa, nunca de forma sincrona.
  const iniciar = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    return cargador({ signal: controller.signal })
      .then((resultado) => {
        setDatos(resultado)
        setError('')
      })
      .catch((err) => {
        if (!esCancelacion(err)) setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
  }, [cargador])

  useEffect(() => {
    iniciar()
    return () => controllerRef.current?.abort()
  }, [iniciar])

  const recargar = useCallback(() => {
    setIsLoading(true)
    return iniciar()
  }, [iniciar])

  return { datos, isLoading, error, recargar, refrescar: iniciar }
}
