import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backtutorias.onrender.com'
const DEV_AUTH_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH === 'true'

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

  const setSessionData = ({ token, rol, matricula, nombre, correo }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('rol', rol)
    localStorage.setItem('matricula', matricula)
    localStorage.setItem('nombre', nombre || '')
    localStorage.setItem('correo', correo || '')
  }

  const navigateByRole = (rol) => {
    if (rol === 'tutor') {
      navigate('/tutor/home')
      return
    }

    if (rol === 'tutorado') {
      navigate('/tutorado/home')
      return
    }

    navigate('/login')
  }

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
      setSessionData({
        token: data.token,
        rol: data.rol,
        matricula,
        nombre: data.nombre,
        correo: data.correo,
      })

      navigateByRole(data.rol)
    } catch {
      setError('Error al conectar con el servidor')
    }
  }

  const loginDev = (rol) => {
    if (!DEV_AUTH_ENABLED) {
      return false
    }

    const sessionByRole = {
      tutor: {
        token: 'dev-token-tutor',
        rol: 'tutor',
        matricula: 'DEV-TUTOR',
        nombre: 'Tutor Demo',
        correo: 'tutor.demo@local.dev',
      },
      tutorado: {
        token: 'dev-token-tutorado',
        rol: 'tutorado',
        matricula: 'DEV-TUTORADO',
        nombre: 'Tutorado Demo',
        correo: 'tutorado.demo@local.dev',
      },
    }

    const session = sessionByRole[rol]
    if (!session) {
      return false
    }

    setSessionData(session)
    navigateByRole(rol)
    return true
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
    loginDev,
    canUseDevAuth: DEV_AUTH_ENABLED,
  }
}

export default useAutentificacion
