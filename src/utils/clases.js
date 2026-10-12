// Une nombres de clase ignorando los valores vacios: clases('a', activo && 'b') -> 'a b'
export const clases = (...valores) => valores.filter(Boolean).join(' ')
