import { useEffect, useState } from 'react'

// true cuando `activo` lleva mas de `esperaMs` sin apagarse; vuelve a false al apagarse. Sirve
// para explicar una espera larga (p. ej. el backend despertando) en lugar de un spinner mudo.
export const useEsperaLarga = (activo, esperaMs = 5000) => {
  const [larga, setLarga] = useState(false)

  useEffect(() => {
    if (!activo) return undefined
    const id = setTimeout(() => setLarga(true), esperaMs)
    return () => {
      clearTimeout(id)
      setLarga(false)
    }
  }, [activo, esperaMs])

  return activo && larga
}
