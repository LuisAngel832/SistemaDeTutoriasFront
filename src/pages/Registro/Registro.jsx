import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAutentificacion from '../../hooks/useAutentificacion'
import '../LogIn/login.css'
import './registro.css'
import './Registro_respon.css'

const ROLES = [
  {
    key: 'tutorado',
    label: 'Tutorado',
    desc: 'Quiero inscribirme a tutorias',
  },
  {
    key: 'tutor',
    label: 'Tutor',
    desc: 'Quiero impartir tutorias',
  },
]

const ROL_IDS = { tutor: 2, tutorado: 3 }

const Registro = () => {
  const { registro } = useAutentificacion()

  const [nombre, setNombre] = useState('')
  const [apellidoP, setApellidoP] = useState('')
  const [apellidoM, setApellidoM] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rol, setRol] = useState('tutorado')
  const [matricula, setMatricula] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearError = () => {
    if (error) setError('')
  }

  const handleRegistro = async (event) => {
    event.preventDefault()

    if (
      !nombre ||
      !apellidoP ||
      !apellidoM ||
      !matricula ||
      !correo ||
      !password ||
      !rol
    ) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres')
      return
    }

    const rolId = ROL_IDS[rol]
    if (!rolId) {
      setError('Rol invalido')
      return
    }

    const usuario = {
      matricula,
      nombre,
      apellidoP,
      apellidoM,
      correo,
      pwd: password,
      rol: rolId,
    }

    setIsSubmitting(true)
    await registro(usuario, setError)
    setIsSubmitting(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-shell registro-shell">
        <aside className="auth-brand">
          <div className="auth-brand-top">
            <span className="auth-brand-dot" aria-hidden="true" />
            <span className="auth-brand-name">Sistema de Tutorias</span>
          </div>

          <div className="auth-brand-body">
            <h1 className="auth-brand-title">Crea tu cuenta</h1>
            <p className="auth-brand-subtitle">
              Registrate como tutor o tutorado y comienza a aprovechar las
              tutorias de tu universidad.
            </p>

            <ul className="auth-brand-features">
              <li>
                <span className="auth-brand-check" aria-hidden="true">✓</span>
                Acceso inmediato a tutorias activas
              </li>
              <li>
                <span className="auth-brand-check" aria-hidden="true">✓</span>
                Inscripcion y cancelacion en un click
              </li>
              <li>
                <span className="auth-brand-check" aria-hidden="true">✓</span>
                Tu historial siempre disponible
              </li>
            </ul>
          </div>

          <p className="auth-brand-foot">© 2026 Sistema de Tutorias</p>
        </aside>

        <section className="auth-form-panel registro-panel">
          <header className="auth-form-header">
            <h2 className="auth-form-title">Registro</h2>
            <p className="auth-form-subtitle">
              Completa tus datos para crear la cuenta.
            </p>
          </header>

          {error ? <div className="auth-feedback error">{error}</div> : null}

          <form className="auth-form registro-grid" onSubmit={handleRegistro}>
            <div className="auth-field full">
              <label className="auth-label">Soy</label>
              <div className="rol-chips" role="radiogroup" aria-label="Tipo de cuenta">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    role="radio"
                    aria-checked={rol === r.key}
                    className={`rol-chip${rol === r.key ? ' active' : ''}`}
                    onClick={() => {
                      setRol(r.key)
                      clearError()
                    }}
                  >
                    <span className="rol-chip-title">
                      <span className="rol-chip-radio" aria-hidden="true" />
                      {r.label}
                    </span>
                    <span className="rol-chip-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="nombre" className="auth-label">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                className="auth-input"
                placeholder="Luis"
                value={nombre}
                onChange={(event) => {
                  setNombre(event.target.value)
                  clearError()
                }}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="matricula" className="auth-label">
                Matricula
              </label>
              <input
                id="matricula"
                type="text"
                className="auth-input"
                placeholder="Ej. 20230001"
                value={matricula}
                onChange={(event) => {
                  setMatricula(event.target.value)
                  clearError()
                }}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="apellidoP" className="auth-label">
                Apellido paterno
              </label>
              <input
                id="apellidoP"
                type="text"
                className="auth-input"
                placeholder="Perez"
                value={apellidoP}
                onChange={(event) => {
                  setApellidoP(event.target.value)
                  clearError()
                }}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="apellidoM" className="auth-label">
                Apellido materno
              </label>
              <input
                id="apellidoM"
                type="text"
                className="auth-input"
                placeholder="Lopez"
                value={apellidoM}
                onChange={(event) => {
                  setApellidoM(event.target.value)
                  clearError()
                }}
                required
              />
            </div>

            <div className="auth-field full">
              <label htmlFor="correo" className="auth-label">
                Correo electronico
              </label>
              <input
                id="correo"
                type="email"
                className="auth-input"
                placeholder="luis@example.com"
                value={correo}
                onChange={(event) => {
                  setCorreo(event.target.value)
                  clearError()
                }}
                required
              />
            </div>

            <div className="auth-field full">
              <label htmlFor="password" className="auth-label">
                Contrasena
              </label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="auth-input with-toggle"
                  placeholder="Minimo 8 caracteres"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearError()
                  }}
                  required
                  minLength={8}
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
              <p className="auth-hint">Debe tener al menos 8 caracteres.</p>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
              style={{ gridColumn: '1 / -1' }}
            >
              {isSubmitting ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className="auth-divider">o</div>

          <p className="auth-switch">
            ¿Ya tienes cuenta?
            <Link to="/login" className="auth-switch-link">
              Iniciar sesion
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Registro
