import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import LogIn from '../pages/LogIn/LogIn'
import Registro from '../pages/Registro/Registro'
import TutorHome from '../pages/Tutor/Home'
import AgregarHorario from '../pages/Tutor/AgregarHorario/AgregarHorario'
import CrearTutoria from '../pages/Tutor/CrearTutoria/CrearTutoria'
import TutoradoHome from '../pages/Tutorado/Home'

const AppRouter = () => {
  const userRole = localStorage.getItem('rol')

  return (
    <Routes>
      <Route path="/login" element={<LogIn />} />
      <Route path="/registro" element={<Registro />} />

      <Route
        path="/"
        element={
          userRole === 'tutor' ? (
            <Navigate to="/tutor/home" replace />
          ) : userRole === 'tutorado' ? (
            <Navigate to="/tutorado/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/tutor/home"
        element={
          <PrivateRoute allowedRoles={['tutor']}>
            <TutorHome />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutor/agregar-horario"
        element={
          <PrivateRoute allowedRoles={['tutor']}>
            <AgregarHorario />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutor/crear"
        element={
          <PrivateRoute allowedRoles={['tutor']}>
            <CrearTutoria />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutorado/home"
        element={
          <PrivateRoute allowedRoles={['tutorado']}>
            <TutoradoHome />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
