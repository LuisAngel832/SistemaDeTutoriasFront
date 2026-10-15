// Ejecuta una mutacion y devuelve el resultado para la pantalla, que no maneja excepciones:
// { ok: true, message, resultado } con lo que respondio el backend, o
// { ok: false, message, errores } con los errores por campo (p. ej. un NRC duplicado).
export const ejecutarMutacion = async (mutacion, variables, mensajeExito) => {
  try {
    const resultado = await mutacion.mutateAsync(variables)
    return { ok: true, message: mensajeExito, resultado }
  } catch (error) {
    return { ok: false, message: error.message, errores: error.errores ?? {} }
  }
}
