import { toast } from 'sonner'

// Muestra el resultado de una accion ({ ok, message }) como aviso flotante.
export const avisar = (resultado, opciones) =>
  resultado.ok
    ? toast.success(resultado.message, opciones)
    : toast.error(resultado.message, opciones)
