import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/hero.png'
import useAutentificacion from '../../hooks/useAutentificacion'
import './registro.css'
import './Registro_respon.css'

const Registro = () => {
  const { registro } = useAutentificacion()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [apellidoP, setApellidoP] = useState('')
  const [apellidoM, setApellidoM] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('tutorado')
  const [matricula, setMatricula] = useState('')

  const ROL_IDS = { tutor: 2, tutorado: 3 }
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearError = () => {
    if (error) {
      setError('')
    }
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
    <div className="registro">
      <div className="registro-content">
        <img src={logo} alt="Logo de Sistema de Tutorias" className="registro-img" />

        {error ? <p className="registro-error">{error}</p> : null}

        <form className="registro-form" onSubmit={handleRegistro}>
          <h2 className="content-title">Registro</h2>

          <label htmlFor="nombre">Nombre</label>
          <input
            className="registro-input"
            type="text"
            id="nombre"
            value={nombre}
            onChange={(event) => {
              setNombre(event.target.value)
              clearError()
            }}
            required
          />

          <label htmlFor="apellidoP">Apellido Paterno</label>
          <input
            className="registro-input"
            type="text"
            id="apellidoP"
            value={apellidoP}
            onChange={(event) => {
              setApellidoP(event.target.value)
              clearError()
            }}
            required
          />

          <label htmlFor="apellidoM">Apellido Materno</label>
          <input
            className="registro-input"
            type="text"
            id="apellidoM"
            value={apellidoM}
            onChange={(event) => {
              setApellidoM(event.target.value)
              clearError()
            }}
            required
          />

          <label htmlFor="matricula">Matricula</label>
          <input
            className="registro-input"
            type="text"
            id="matricula"
            value={matricula}
            onChange={(event) => {
              setMatricula(event.target.value)
              clearError()
            }}
            required
          />

          <label htmlFor="correo">Correo electronico</label>
          <input
            className="registro-input"
            type="email"
            id="correo"
            value={correo}
            onChange={(event) => {
              setCorreo(event.target.value)
              clearError()
            }}
            required
          />

          <label htmlFor="password">Contrasena</label>
          <input
            className="registro-input"
            type="password"
            id="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              clearError()
            }}
            required
          />

          <label htmlFor="rol">Rol</label>
          <select
            id="rol"
            className="registro-input"
            value={rol}
            onChange={(event) => {
              setRol(event.target.value)
              clearError()
            }}
            required
          >
            <option value="tutorado">Tutorado</option>
            <option value="tutor">Tutor</option>
          </select>

          <button type="submit" className="button-confirm" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>

          <section className="registro-buttons">
            <button
              type="button"
              className="registro-login"
              onClick={() => navigate('/login')}
            >
              LogIn
            </button>
          </section>
        </form>
      </div>
    </div>
  )
}

export default Registro
