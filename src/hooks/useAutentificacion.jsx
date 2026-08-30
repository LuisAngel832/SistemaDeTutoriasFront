import { useNavigate } from 'react-router-dom'

// Vacio en dev para usar el proxy de Vite (mismo origen, sin CORS).
// Para apuntar a otro backend, define VITE_API_URL en .env (ej. URL de produccion).
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const buildJsonConfig = (payload) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const parseResponse = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const extractErrorMessage = (body, fallback) => {
  if (!body) return fallback
  if (typeof body === 'string' && body.trim()) return body
  if (body.message) {
    if (body.data && typeof body.data === 'object') {
      const firstField = Object.values(body.data)[0]
      if (firstField) return `${body.message}: ${firstField}`
    }
    return body.message
  }
  return fallback
}

const normalizeRol = (rol) => (rol ? String(rol).toLowerCase() : '')

const useAutentificacion = () => {
  const navigate = useNavigate()

  const login = async (matricula, pwd, setError) => {
    setError('')

    try {
      const response = await fetch(
        `${BASE_URL}/auth/signin`,
        buildJsonConfig({ matricula, pwd }),
      )

      const body = await parseResponse(response)

      if (!response.ok || !body?.success) {
        setError(extractErrorMessage(body, 'Usuario o contrasena incorrectos'))
        return
      }

      const { token, rol, nombre, apellidoP, apellidoM } = body.data ?? {}
      if (!token || !rol) {
        setError('Respuesta del servidor invalida')
        return
      }

      const rolNormalizado = normalizeRol(rol)
      const nombreCompleto = [nombre, apellidoP, apellidoM]
        .filter(Boolean)
        .join(' ')
        .trim()

      localStorage.setItem('token', token)
      localStorage.setItem('rol', rolNormalizado)
      localStorage.setItem('matricula', matricula)

      // El nombre es opcional: no todos los endpoints de login lo devuelven.
      if (nombreCompleto) {
        localStorage.setItem('nombre', nombreCompleto)
      } else {
        localStorage.removeItem('nombre')
      }

      if (rolNormalizado === 'tutor') {
        navigate('/tutor/home')
      } else if (rolNormalizado === 'tutorado') {
        navigate('/tutorado/home')
      } else if (rolNormalizado === 'admin') {
        navigate('/tutor/home')
      } else {
        navigate('/login')
      }
    } catch {
      setError('Error al conectar con el servidor')
    }
  }

  const registro = async (usuario, setError) => {
    setError('')

    try {
      const response = await fetch(
        `${BASE_URL}/auth/signup`,
        buildJsonConfig(usuario),
      )

      const body = await parseResponse(response)

      if (!response.ok || !body?.success) {
        setError(extractErrorMessage(body, 'No se pudo completar el registro'))
        return false
      }

      navigate('/login')
      return true
    } catch {
      setError('No se pudo conectar al servidor')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('matricula')
    localStorage.removeItem('nombre')
    localStorage.removeItem('correo')
    navigate('/login')
  }

  return {
    login,
    registro,
    logout,
  }
}

export default useAutentificacion
