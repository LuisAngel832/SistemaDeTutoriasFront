import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import LogIn from '../pages/LogIn/LogIn'
import Registro from '../pages/Registro/Registro'
import TutorHome from '../pages/Tutor/Home/Home'
import TutorTutoria from '../pages/Tutor/Tutoria/Tutoria'
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
        path="/tutor/tutoria/:id"
        element={
          <PrivateRoute allowedRoles={['tutor']}>
            <TutorTutoria />
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
