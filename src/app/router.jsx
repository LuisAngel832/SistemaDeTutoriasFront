import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CargandoPagina } from '@/components/layout/CargandoPagina'
import { ROLES_ADMIN, ROLES_TUTOR, ROLES_TUTORADO } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { RedireccionInicio, RequireRole, SoloInvitados } from '@/features/auth/guards'
import PaginaError from './PaginaError'
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
            lazy: pagina(() => import('@/features/auth/pages/LogIn')),
          },
          {
            path: ROUTES.registro,
            handle: { titulo: 'Crear cuenta' },
            lazy: pagina(() => import('@/features/auth/pages/Registro')),
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
                    lazy: pagina(() => import('@/features/tutor/pages/Home')),
                  },
                  {
                    path: ROUTES.tutor.nuevaTutoria,
                    handle: { titulo: 'Crear tutoría' },
                    lazy: pagina(() => import('@/features/tutor/pages/CrearTutoria/CrearTutoria')),
                  },
                  {
                    path: ROUTES.tutor.detalle(':id'),
                    handle: { titulo: 'Detalle de tutoría' },
                    lazy: pagina(
                      () => import('@/features/tutor/pages/TutoriaDetalle/TutoriaDetalle'),
                    ),
                  },
                  {
                    path: ROUTES.tutor.editar(':id'),
                    handle: { titulo: 'Editar tutoría' },
                    lazy: pagina(() => import('@/features/tutor/pages/EditarTutoria')),
                  },
                  {
                    path: ROUTES.tutor.paseDeLista(':idSesion'),
                    handle: { titulo: 'Pase de lista' },
                    lazy: pagina(() => import('@/features/tutor/pages/PaseDeLista')),
                  },
                  {
                    path: ROUTES.tutor.historial(),
                    handle: { titulo: 'Historial de asistencia' },
                    lazy: pagina(() => import('@/features/tutor/pages/HistorialAsistencia')),
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
                    lazy: pagina(() => import('@/features/tutorado/pages/Home')),
                  },
                  {
                    path: ROUTES.tutorado.inscripciones,
                    handle: { titulo: 'Mis tutorías' },
                    lazy: pagina(() => import('@/features/tutorado/pages/MisTutorias')),
                  },
                  {
                    path: ROUTES.tutorado.detalle(':id'),
                    handle: { titulo: 'Detalle de tutoría' },
                    lazy: pagina(() => import('@/features/tutorado/pages/TutoriaDetalle')),
                  },
                  {
                    path: ROUTES.tutorado.asistencia(':idTutoria'),
                    handle: { titulo: 'Mi asistencia' },
                    lazy: pagina(() => import('@/features/tutorado/pages/MiAsistencia')),
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        element: <RequireRole roles={ROLES_ADMIN} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                errorElement: <PaginaError />,
                children: [
                  {
                    path: ROUTES.admin.inicio,
                    handle: { titulo: 'Tutorías de la facultad' },
                    lazy: pagina(() => import('@/features/admin/pages/TutoriasFacultad')),
                  },
                  {
                    path: ROUTES.admin.experiencias,
                    handle: { titulo: 'Experiencias Educativas' },
                    lazy: pagina(() => import('@/features/admin/pages/ExperienciasEducativas')),
                  },
                ],
              },
            ],
          },
        ],
      },

      // URLs anteriores
      { path: '/tutor/crear', element: <Navigate to={ROUTES.tutor.nuevaTutoria} replace /> },
      // La disponibilidad del tutor ya no existe: los horarios son parte de cada tutoria.
      { path: '/tutor/horarios', element: <Navigate to={ROUTES.tutor.inicio} replace /> },
      { path: '/tutor/agregar-horario', element: <Navigate to={ROUTES.tutor.inicio} replace /> },
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
        lazy: pagina(() => import('./NoEncontrada')),
      },
    ],
  },
]

export const crearRouter = () => createBrowserRouter(rutas)
