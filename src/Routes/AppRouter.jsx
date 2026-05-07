import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import LogIn from '../pages/LogIn/LogIn'
import Registro from '../pages/Registro/Registro'
import TutorHome from '../pages/Tutor/Home'
import TutoradoHome from '../pages/Tutorado/HomeT/HomeT'
import TutoriaT from '../pages/Tutorado/TutoriaT/TutoriaT'

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
        path="/tutorado/home"
        element={
          <PrivateRoute allowedRoles={['tutorado']}>
            <TutoradoHome />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutorado/infoTutoria/:id"
        element={
          <PrivateRoute allowedRoles={['tutorado']}>
            <TutoriaT />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
