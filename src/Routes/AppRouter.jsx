import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import { HOME_POR_ROL, ROLES } from '../constants/roles'
import { useAuth } from '../features/auth/AuthContext'
import LogIn from '../pages/LogIn/LogIn'
import Registro from '../pages/Registro/Registro'
import TutorHome from '../pages/Tutor/Home'
import AgregarHorario from '../pages/Tutor/AgregarHorario/AgregarHorario'
import CrearTutoria from '../pages/Tutor/CrearTutoria/CrearTutoria'
import TutoriaDetalleTutor from '../pages/Tutor/TutoriaDetalle/TutoriaDetalle'
import TutoradoHome from '../pages/Tutorado/Home'
import TutoriaDetalle from '../pages/Tutorado/TutoriaDetalle'
import MisTutorias from '../pages/Tutorado/MisTutorias'

// El admin no tiene panel propio: comparte las pantallas del tutor.
const ROLES_TUTOR = [ROLES.TUTOR, ROLES.ADMIN]
const ROLES_TUTORADO = [ROLES.TUTORADO]

const AppRouter = () => {
  const { rol: userRole } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LogIn />} />
      <Route path="/registro" element={<Registro />} />

      <Route path="/" element={<Navigate to={HOME_POR_ROL[userRole] ?? '/login'} replace />} />

      <Route
        path="/tutor/home"
        element={
          <PrivateRoute allowedRoles={ROLES_TUTOR}>
            <TutorHome />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutor/agregar-horario"
        element={
          <PrivateRoute allowedRoles={ROLES_TUTOR}>
            <AgregarHorario />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutor/crear"
        element={
          <PrivateRoute allowedRoles={ROLES_TUTOR}>
            <CrearTutoria />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutor/tutoria/:id"
        element={
          <PrivateRoute allowedRoles={ROLES_TUTOR}>
            <TutoriaDetalleTutor />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutorado/home"
        element={
          <PrivateRoute allowedRoles={ROLES_TUTORADO}>
            <TutoradoHome />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutorado/infoTutoria/:id"
        element={
          <PrivateRoute allowedRoles={ROLES_TUTORADO}>
            <TutoriaDetalle />
          </PrivateRoute>
        }
      />

      <Route
        path="/tutorado/tutorias"
        element={
          <PrivateRoute allowedRoles={ROLES_TUTORADO}>
            <MisTutorias />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
