import { Link } from 'react-router-dom'
import { useState } from 'react'
import useAutentificacion from '../../hooks/useAutentificacion'
import './login.css'
import './Login_respon.css'

const LogIn = () => {
  const { login } = useAutentificacion()

  const [matricula, setMatricula] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearError = () => {
    if (error) setError('')
  }

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
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-brand">
          <div className="auth-brand-top">
            <span className="auth-brand-dot" aria-hidden="true" />
            <span className="auth-brand-name">Sistema de Tutorias</span>
          </div>

          <div className="auth-brand-body">
            <h1 className="auth-brand-title">
              Bienvenido de vuelta
            </h1>
            <p className="auth-brand-subtitle">
              Gestiona tus tutorias, horarios e inscripciones desde un solo lugar.
            </p>

            <ul className="auth-brand-features">
              <li>
                <span className="auth-brand-check" aria-hidden="true">✓</span>
                Programa sesiones de manera sencilla
              </li>
              <li>
                <span className="auth-brand-check" aria-hidden="true">✓</span>
                Da seguimiento a tus tutorados
              </li>
              <li>
                <span className="auth-brand-check" aria-hidden="true">✓</span>
                Mantente al dia con tus horarios
              </li>
            </ul>
          </div>

          <p className="auth-brand-foot">© 2026 Sistema de Tutorias</p>
        </aside>

        <section className="auth-form-panel">
          <header className="auth-form-header">
            <h2 className="auth-form-title">Iniciar sesion</h2>
            <p className="auth-form-subtitle">
              Ingresa con tu matricula para continuar.
            </p>
          </header>

          {error ? <div className="auth-feedback error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="matricula" className="auth-label">
                Matricula
              </label>
              <input
                type="text"
                id="matricula"
                className="auth-input"
                placeholder="Ej. 20230001"
                value={matricula}
                onChange={(event) => {
                  setMatricula(event.target.value)
                  clearError()
                }}
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="contrasena" className="auth-label">
                Contrasena
              </label>
              <div className="auth-input-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  id="contrasena"
                  className="auth-input with-toggle"
                  placeholder="Tu contrasena"
                  value={contrasena}
                  onChange={(event) => {
                    setContrasena(event.target.value)
                    clearError()
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPwd((prev) => !prev)}
                  aria-label={showPwd ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPwd ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Ingresando...
                </>
              ) : (
                'Iniciar sesion'
              )}
            </button>
          </form>

          <div className="auth-divider">o</div>

          <p className="auth-switch">
            ¿No tienes cuenta?
            <Link to="/registro" className="auth-switch-link">
              Crear cuenta
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default LogIn
