import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backtutorias.onrender.com'

const buildJsonConfig = (payload) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const normalizeErrorMessage = async (response, fallback) => {
  try {
    const data = await response.json()
    if (typeof data === 'string' && data.trim()) {
      return data
    }
    if (data?.message) {
      return data.message
    }
    return fallback
  } catch {
    const text = await response.text()
    return text || fallback
  }
}

const useAutentificacion = () => {
  const navigate = useNavigate()

  const login = async (matricula, password, setError) => {
    setError('')

    try {
      const response = await fetch(
        `${BASE_URL}/auth/login`,
        buildJsonConfig({ matricula, password }),
      )

      if (!response.ok) {
        const message = await normalizeErrorMessage(
          response,
          'Usuario o contrasena incorrectos',
        )
        setError(message)
        return
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('rol', data.rol)
      localStorage.setItem('matricula', matricula)
      localStorage.setItem('nombre', data.nombre || '')
      localStorage.setItem('correo', data.correo || '')

      if (data.rol === 'tutor') {
        navigate('/tutor/home')
      } else if (data.rol === 'tutorado') {
        navigate('/tutorado/home')
      } else {
        navigate('/login')
      }
    } catch {
      setError('Error al conectar con el servidor')
    }
  }

  const registro = async (rol, usuario, setError) => {
    setError('')

    const endpoint =
      rol === 'profesor' ? '/tutor/registro' : '/tutorado/registro'

    try {
      const response = await fetch(
        `${BASE_URL}${endpoint}`,
        buildJsonConfig(usuario),
      )

      if (!response.ok) {
        const message = await normalizeErrorMessage(
          response,
          'No se pudo completar el registro',
        )
        setError(message)
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
