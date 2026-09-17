import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { CargandoPagina } from '../components/layout/CargandoPagina'
import { ROLES_TUTOR, ROLES_TUTORADO } from '../constants/roles'
import { ROUTES } from '../constants/routes'
import { RedireccionInicio, RequireRole, SoloInvitados } from '../features/auth/guards'
import PaginaError from '../pages/Sistema/PaginaError'
import { RaizApp } from './RaizApp'
import { RedirigirDetalle } from './RedirigirDetalle'

// Cada pagina se descarga solo cuando se visita.
const pagina = (importar) => async () => ({ Component: (await importar()).default })

export const rutas = [
  {
    element: <RaizApp />,
    errorElement: <PaginaError />,
    HydrateFallback: CargandoPagina,
    children: [
      { path: ROUTES.inicio, element: <RedireccionInicio /> },

      {
        element: <SoloInvitados />,
        children: [
          {
            path: ROUTES.login,
            handle: { titulo: 'Iniciar sesión' },
            lazy: pagina(() => import('../pages/LogIn/LogIn')),
          },
          {
            path: ROUTES.registro,
            handle: { titulo: 'Crear cuenta' },
            lazy: pagina(() => import('../pages/Registro/Registro')),
          },
        ],
      },

      {
        element: <RequireRole roles={ROLES_TUTOR} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                // Los errores de una pagina se muestran sin perder la navegacion lateral.
                errorElement: <PaginaError />,
                children: [
                  {
                    path: ROUTES.tutor.inicio,
                    handle: { titulo: 'Mis tutorías' },
                    lazy: pagina(() => import('../pages/Tutor/Home')),
                  },
                  {
                    path: ROUTES.tutor.nuevaTutoria,
                    handle: { titulo: 'Crear tutoría' },
                    lazy: pagina(() => import('../pages/Tutor/CrearTutoria/CrearTutoria')),
                  },
                  {
                    path: ROUTES.tutor.horarios,
                    handle: { titulo: 'Mis horarios' },
                    lazy: pagina(() => import('../pages/Tutor/AgregarHorario/AgregarHorario')),
                  },
                  {
                    path: ROUTES.tutor.detalle(':id'),
                    handle: { titulo: 'Detalle de tutoría' },
                    lazy: pagina(() => import('../pages/Tutor/TutoriaDetalle/TutoriaDetalle')),
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        element: <RequireRole roles={ROLES_TUTORADO} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                errorElement: <PaginaError />,
                children: [
                  {
                    path: ROUTES.tutorado.inicio,
                    handle: { titulo: 'Explorar tutorías' },
                    lazy: pagina(() => import('../pages/Tutorado/Home')),
                  },
                  {
                    path: ROUTES.tutorado.inscripciones,
                    handle: { titulo: 'Mis tutorías' },
                    lazy: pagina(() => import('../pages/Tutorado/MisTutorias')),
                  },
                  {
                    path: ROUTES.tutorado.detalle(':id'),
                    handle: { titulo: 'Detalle de tutoría' },
                    lazy: pagina(() => import('../pages/Tutorado/TutoriaDetalle')),
                  },
                ],
              },
            ],
          },
        ],
      },

      // URLs anteriores
      { path: '/tutor/crear', element: <Navigate to={ROUTES.tutor.nuevaTutoria} replace /> },
      { path: '/tutor/agregar-horario', element: <Navigate to={ROUTES.tutor.horarios} replace /> },
      { path: '/tutor/tutoria/:id', element: <RedirigirDetalle destino={ROUTES.tutor.detalle} /> },
      {
        path: '/tutorado/infoTutoria/:id',
        element: <RedirigirDetalle destino={ROUTES.tutorado.detalle} />,
      },
      {
        path: '/tutorado/tutorias',
        element: <Navigate to={ROUTES.tutorado.inscripciones} replace />,
      },

      {
        path: '*',
        handle: { titulo: 'Página no encontrada' },
        lazy: pagina(() => import('../pages/Sistema/NoEncontrada')),
      },
    ],
  },
]

export const crearRouter = () => createBrowserRouter(rutas)
