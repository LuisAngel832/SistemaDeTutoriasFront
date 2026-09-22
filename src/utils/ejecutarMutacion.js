// Ejecuta una mutacion y devuelve { ok, message } para mostrarlo en la pantalla.
// Las pantallas no manejan excepciones: solo muestran el mensaje.
export const ejecutarMutacion = async (mutacion, variables, mensajeExito) => {
  try {
    await mutacion.mutateAsync(variables)
    return { ok: true, message: mensajeExito }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}
