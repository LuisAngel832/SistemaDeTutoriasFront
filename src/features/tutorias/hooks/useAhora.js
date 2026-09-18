import { useEffect, useState } from 'react'

// Devuelve Date.now() y lo actualiza cada `intervaloMs` para re-evaluar reglas que
// dependen de la hora (p. ej. si ya se puede completar o cancelar una tutoria).
export const useAhora = (intervaloMs = 30_000) => {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), intervaloMs)
    return () => clearInterval(id)
  }, [intervaloMs])

  return ahora
}
