import { Link } from 'react-router-dom'
import { useState } from 'react'
import logo from '../../assets/hero.png'
import useAutentificacion from '../../hooks/useAutentificacion'
import './login.css'
import './Login_respon.css'

const LogIn = () => {
  const { login, loginDev, canUseDevAuth } = useAutentificacion()

  const [matricula, setMatricula] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    if (!matricula || !contrasena) {
      setError('Todos los campos son obligatorios')
      return
    }

    setIsSubmitting(true)
    await login(matricula, contrasena, setError)
    setIsSubmitting(false)
  }

  return (
    <div className="Login">
      <div className="login-content">
        <img src={logo} alt="Logo de Sistema de Tutorias" className="login-img" />

        {canUseDevAuth ? (
          <section className="dev-login-box" aria-label="Acceso de desarrollo">
            <p className="dev-login-title">Modo desarrollo activo</p>
            <div className="dev-login-actions">
              <button type="button" onClick={() => loginDev('tutor')}>
                Entrar como Tutor (Demo)
              </button>
              <button type="button" onClick={() => loginDev('tutorado')}>
                Entrar como Tutorado (Demo)
              </button>
            </div>
          </section>
        ) : null}

        {error ? <p className="error">{error}</p> : null}

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="matricula">Matricula</label>
          <input
            type="text"
            id="matricula"
            className="login-input"
            value={matricula}
            onChange={(event) => {
              setMatricula(event.target.value)
              if (error) {
                setError('')
              }
            }}
          />

          <label htmlFor="contrasena">Contrasena</label>
          <input
            type="password"
            id="contrasena"
            className="login-input"
            value={contrasena}
            onChange={(event) => {
              setContrasena(event.target.value)
              if (error) {
                setError('')
              }
            }}
          />

          <button type="submit" className="login-button-confirm" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>

          <section className="login-buttons">
            <Link to="/registro">
              <button type="button">Registrarse</button>
            </Link>
          </section>
        </form>
      </div>
    </div>
  )
}

export default LogIn
