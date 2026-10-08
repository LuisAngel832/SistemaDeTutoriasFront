import { useEffect, useState } from 'react'

// Devuelve `valor` cuando deja de cambiar durante `esperaMs` (busquedas mientras se escribe).
export const useValorDiferido = (valor, esperaMs = 300) => {
  const [diferido, setDiferido] = useState(valor)

  useEffect(() => {
    const id = setTimeout(() => setDiferido(valor), esperaMs)
    return () => clearTimeout(id)
  }, [valor, esperaMs])

  return diferido
}
