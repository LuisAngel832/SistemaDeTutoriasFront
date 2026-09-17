# Sistema de Tutorias - Frontend

Plataforma web para gestionar tutorias academicas entre estudiantes de la carrera
de Administracion de la **Facultad de Negocios y Tecnologias (FNT)** de la
Universidad Veracruzana. Esta es la aplicacion **frontend** construida con React y
Vite que consume la API REST del [backend en Spring Boot](https://github.com/Shtven/TutoriasBackend).

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Configuracion del entorno](#configuracion-del-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Calidad de codigo](#calidad-de-codigo)
- [Proxy de desarrollo y CORS](#proxy-de-desarrollo-y-cors)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas principales](#rutas-principales)
- [Integracion con el backend](#integracion-con-el-backend)
- [Contribuir](#contribuir)
- [Solucion de problemas comunes](#solucion-de-problemas-comunes)

## Funcionalidades

### Autenticacion

- Registro de usuarios con rol Tutor o Tutorado (matricula como identificador).
- Inicio de sesion con JWT y redireccion automatica al panel correspondiente.
- Toggle de mostrar/ocultar contrasena, validacion de longitud minima.

### Panel del Tutor

- Listado de tutorias propias con estado, fecha, horario, lugar y temas.
- Creacion de tutorias: seleccion de Experiencia Educativa (cargada del back), horario, fecha,
  edificio, aula y **temas tentativos** (chips dinamicos).
- Gestion de horarios recurrentes con selector de dia, hora inicio/fin y lista
  inline de los horarios creados (eliminacion en un click).
- Pagina de detalle por tutoria con:
  - Edicion de fecha, horario, edificio y aula.
  - Edicion inline de temas (agregar/quitar).
  - Boton para marcar como completada o cancelar (con confirmacion).
  - Lista de inscritos con estado de asistencia (Pendiente / Asistio / No asistio).
  - Vista de comentarios y sugerencias de los tutorados.

### Panel del Tutorado

- Explorar tutorias disponibles con buscador por Experiencia Educativa o tutor.
- Detalle de tutoria con inscripcion y cancelacion (la cancelacion respeta la
  regla del backend: hasta 15 min antes de inicio).
- Zona de comentarios para sugerir temas u observaciones previas a la sesion.
- Listado de inscripciones propias.

### Interfaz

- Diseno responsive con breakpoints para escritorio, tablet y movil.
- Sidebar lateral colapsable (se recuerda la preferencia) y drawer con menu hamburguesa en
  pantallas pequenas.
- Tema visual unificado (paleta azul/verde) con animaciones sutiles.
- Soporte para `prefers-reduced-motion`.

## Stack

| Capa               | Tecnologia                                                                |
| ------------------ | ------------------------------------------------------------------------- |
| Build & dev server | [Vite](https://vitejs.dev/) 8                                             |
| UI                 | [React](https://react.dev/) 19                                            |
| Routing            | [react-router-dom](https://reactrouter.com/) 7                            |
| Pruebas            | Vitest + Testing Library (jsdom) y MSW                                    |
| Lint               | ESLint 10 con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh` |
| Formato            | Prettier 3 + lint-staged (pre-commit) y commitlint (commit-msg)           |
| Lenguaje           | JavaScript (JSX)                                                          |
| Estilos            | CSS por componente con tokens de diseno y tipografia Montserrat           |

## Requisitos

- **Node.js 22.12+** (Vite 8 y commitlint lo requieren). El repo incluye `.nvmrc`:
  con nvm basta ejecutar `nvm use`.
- **npm 10+** (incluido con Node).
- Backend del [Sistema de Tutorias](https://github.com/Shtven/TutoriasBackend)
  corriendo (por defecto en `http://localhost:8080`) si quieres usar las
  funcionalidades autenticadas.

Para verificar tu version de Node:

```bash
node --version
npm --version
```

## Instalacion

```bash
git clone https://github.com/LuisAngel832/SistemaDeTutoriasFront.git
cd SistemaDeTutoriasFront
npm install
cp .env.example .env
```

## Configuracion del entorno

El archivo `.env` se crea a partir de `.env.example` y define las variables que
usa Vite en build time.

| Variable           | Default                 | Descripcion                                                                                                                                                                 |
| ------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`     | (vacio)                 | URL absoluta del backend. **Dejar vacio para usar el proxy de Vite** (recomendado en desarrollo). Si la defines, la app la usa como prefijo en todas las llamadas a la API. |
| `VITE_BACKEND_URL` | `http://localhost:8080` | URL a la que Vite proxea las peticiones en desarrollo. Solo aplica si `VITE_API_URL` queda vacio.                                                                           |

Variables sensibles (tokens, secretos) no se almacenan en este repo. El `.env`
local esta listado en `.gitignore`.

## Scripts disponibles

| Comando                 | Descripcion                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Levanta el servidor de desarrollo con HMR en `http://localhost:5173` (o el siguiente puerto disponible). |
| `npm run build`         | Compila a produccion en la carpeta `dist/`.                                                              |
| `npm run preview`       | Sirve el `dist/` localmente para probar el build.                                                        |
| `npm run lint`          | Ejecuta ESLint sobre todo el codigo.                                                                     |
| `npm run format`        | Formatea todo el proyecto con Prettier.                                                                  |
| `npm run format:check`  | Verifica el formato sin modificar archivos (lo usa el CI).                                               |
| `npm run test`          | Ejecuta las pruebas con Vitest en modo watch.                                                            |
| `npm run test:run`      | Ejecuta las pruebas una sola vez (lo usa el CI).                                                         |
| `npm run test:coverage` | Ejecuta las pruebas y genera el reporte de cobertura en `coverage/`.                                     |

## Calidad de codigo

- **Hooks de git (Husky):** al hacer commit se ejecutan ESLint y Prettier sobre los archivos
  en stage, y commitlint valida que el mensaje siga Conventional Commits. Se instalan solos
  con `npm install`.
- **CI (GitHub Actions):** cada push y PR hacia `main` o `develop` corre lint, verificacion de
  formato, pruebas y build ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
- **Dependabot** propone actualizaciones semanales de dependencias.
- **git blame:** para omitir el commit de formato masivo ejecuta una vez
  `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

## Proxy de desarrollo y CORS

El backend de Spring Boot no expone reglas CORS en el `SecurityConfig`, por lo
que en desarrollo el front evita CORS reenviando las peticiones a traves del
proxy de Vite ([`vite.config.js`](vite.config.js)). Los siguientes prefijos se
reenvian a `VITE_BACKEND_URL` (`http://localhost:8080` por defecto):

- `/auth/*`
- `/materia/*`
- `/horario/*`
- `/tutoria/*` y `/tutorias/*`
- `/temas/*`
- `/asistencia/*`
- `/comentarios/*`

Por eso los hooks del front pegan a paths relativos (`/auth/signin`, etc.) en
vez de URLs absolutas, salvo que definas `VITE_API_URL` apuntando a un
backend desplegado.

## Despliegue en Render (Static Site)

El front se despliega como **Static Site** en Render usando el blueprint
[`render.yaml`](render.yaml):

| Parametro         | Valor                             |
| ----------------- | --------------------------------- |
| Build command     | `npm ci && npm run build`         |
| Publish directory | `dist`                            |
| Rewrite (SPA)     | `/*` -> `/index.html`             |
| `VITE_API_URL`    | `https://tutoriasbe.onrender.com` |

Pasos:

1. En Render: **New + > Blueprint** y selecciona este repositorio. Render lee
   `render.yaml` y crea el servicio con la configuracion anterior.
   - Alternativa manual: **New + > Static Site**, build `npm ci && npm run build`,
     publish `dist`, agrega la env var `VITE_API_URL` y la regla de _rewrite_.
2. La URL de produccion del backend se toma de [`.env.production`](.env.production)
   (versionado, sin secretos) y/o de la env var `VITE_API_URL` de Render. Se
   incrusta en el bundle durante el build.

> **Importante — CORS:** en produccion **no existe el proxy de Vite**, así que el
> navegador llama al backend en `https://tutoriasbe.onrender.com` desde otro
> origen. El backend de Spring Boot debe habilitar CORS para el dominio del
> Static Site (ej. `https://tutorias-frontend.onrender.com`), de lo contrario las
> peticiones seran bloqueadas por el navegador.

## Estructura del proyecto

```
src/
  app/
    router.jsx             # Rutas, carga diferida, redirecciones y paginas de error
    RaizApp.jsx            # Raiz: sesion, titulo del documento y barra de navegacion
  assets/css/components/   # CSS compartido (sidebar)
  components/
    Comentarios.jsx        # Comentarios de una tutoria (RF15)
    layout/
      AppLayout.jsx        # Estructura de las paginas privadas (sidebar + contenido)
      Sidebar.jsx          # Navegacion lateral por rol
      icons.jsx            # Iconos SVG de la navegacion
    Tutor/
      TemasInput.jsx       # Input de chips para temas (RF14)
      VentanaEmerjente.jsx # Modal de resultado
  constants/               # Rutas, roles, estados de tutoria, espacios y dias de la semana
  api/                     # Cliente HTTP, servicios por recurso y mappers de DTOs
  features/
    auth/                  # AuthProvider, useAuth, guards de rutas, storage y lectura del JWT
  hooks/
    useAhora.js            # Hora actual que se refresca periodicamente
    useRecurso.js          # Carga de datos con cancelacion (base de los demas hooks)
    useComentarios.jsx     # CRUD de comentarios sobre una tutoria
    useCrearTutoria.jsx    # Estado y submit de crear tutoria
    useHorarios.jsx        # CRUD de horarios del tutor
    useMisTutorias.jsx     # Tutorias del tutor autenticado
    useTutoriaDetalleTutor.jsx     # Detalle, edicion, cancelar, completar, temas
    useTutoriaDetalleTutorado.jsx  # Detalle + inscripcion + cancelacion
    useTutoriasExplorar.jsx        # Listado de tutorias disponibles
    useTutoriasTutorado.jsx        # Inscripciones del tutorado
  pages/
    Sistema/               # Paginas 404 y de error
    LogIn/                 # Pantalla de inicio de sesion
    Registro/              # Pantalla de registro
    Tutor/
      Home.jsx             # Mis tutorias (tutor)
      AgregarHorario/
      CrearTutoria/
      TutoriaDetalle/      # Detalle de tutoria del tutor
    Tutorado/
      Home.jsx             # Explorar tutorias
      MisTutorias.jsx
      TutoriaDetalle.jsx
  styles/
    tokens.css             # Colores, sombras y radios (unica fuente de valores de diseno)
    animations.css         # Animaciones compartidas y reduccion de movimiento
    global.css             # Estilos base del documento
  utils/
    fechas.js              # Fechas en hora local y tiempo restante
    formatters.js          # Formato de fechas, horas, temas e iniciales
    tutoria.js             # Reglas de dominio (estado, horario de una tutoria)
```

## Rutas principales

Las rutas se definen en [`src/app/router.jsx`](src/app/router.jsx) y sus URLs en
[`src/constants/routes.js`](src/constants/routes.js). Cada pagina se descarga solo al visitarla.

| Ruta                      | Rol          | Pantalla                                             |
| ------------------------- | ------------ | ---------------------------------------------------- |
| `/login`                  | publico      | Inicio de sesion                                     |
| `/registro`               | publico      | Registro                                             |
| `/tutor/home`             | TUTOR, ADMIN | Mis tutorias                                         |
| `/tutor/tutorias/nueva`   | TUTOR, ADMIN | Crear tutoria                                        |
| `/tutor/horarios`         | TUTOR, ADMIN | Gestionar horarios                                   |
| `/tutor/tutorias/:id`     | TUTOR, ADMIN | Detalle de tutoria (editar, cancelar, ver inscritos) |
| `/tutorado/home`          | TUTORADO     | Explorar tutorias                                    |
| `/tutorado/inscripciones` | TUTORADO     | Mis inscripciones                                    |
| `/tutorado/tutorias/:id`  | TUTORADO     | Detalle de tutoria (inscribirse, cancelar, comentar) |

- `RequireRole` redirige a `/login` si no hay sesion (y vuelve a la ruta pedida despues del
  login) o a la pantalla inicial del usuario si su rol no corresponde.
- Con sesion activa, `/login` y `/registro` redirigen al inicio del rol.
- Las URLs anteriores (`/tutor/crear`, `/tutor/agregar-horario`, `/tutor/tutoria/:id`,
  `/tutorado/tutorias`, `/tutorado/infoTutoria/:id`) redirigen a las nuevas.
- Las rutas desconocidas muestran una pagina 404 y los errores inesperados una pagina de error
  con opcion de reintentar.

## Integracion con el backend

El backend espera autenticacion JWT en el header `Authorization: Bearer <token>`.

- **Cliente HTTP** ([`src/api/client.js`](src/api/client.js)): todas las llamadas pasan por
  aqui. Agrega el token, aplica un timeout de 15 s, convierte los errores en `ApiError` con el
  mensaje del backend y cancela peticiones al desmontar las pantallas.
- **Servicios y mappers** (`src/api/*.js`): un servicio por recurso; `mappers.js` adapta los
  DTOs del backend a la forma que usan las pantallas.
- **Sesion** ([`src/features/auth`](src/features/auth)): `AuthProvider` guarda token, rol,
  matricula y nombre (en `localStorage`, claves `token`, `rol`, `matricula` y `nombre`) y
  los expone con `useAuth()`. La sesion se cierra y se avisa al usuario cuando el token vence
  (segun su `exp`) o el backend responde `401`.

Endpoints consumidos:

- `POST /auth/signup`, `POST /auth/signin`
- `GET/POST/PUT/DELETE /horario`, `GET /horario/{id}`
- `GET /materia` (cargado de la lista de experiencias educativas para crear tutoria)
- `POST /tutoria`, `GET /tutoria/mis-tutorias`, `GET /tutoria/disponibles`,
  `GET/PUT/DELETE /tutoria/{id}`, `PUT /tutoria/completar/{id}`
- `POST /temas`, `GET /temas/tutoria/{id}`, `DELETE /temas/{id}` (RF14)
- `POST /comentarios`, `GET /comentarios/tutoria/{id}`,
  `GET /comentarios/mis-comentarios`, `DELETE /comentarios/{id}` (RF15)
- `POST /asistencia`, `GET /asistencia/mis-inscripciones`,
  `GET /asistencia/tutoria/{idTutoria}`, `DELETE /asistencia/{idAsistencia}`,
  `PATCH /asistencia/{idAsistencia}?asistio=true`

Wrapper de respuesta esperado del backend:

```json
{ "success": true, "message": "...", "data": {} }
```

## Contribuir

Las convenciones de ramas, commits, codigo y el checklist de cada PR estan en
[CONTRIBUTING.md](CONTRIBUTING.md). El plan de mejoras en curso esta en
[PLAN_IMPLEMENTACION.md](PLAN_IMPLEMENTACION.md).

## Solucion de problemas comunes

**El navegador devuelve 502 al pegarle al backend.**
El proxy de Vite no puede alcanzar el backend. Verifica que tu backend Spring
Boot este corriendo en `http://localhost:8080` o ajusta `VITE_BACKEND_URL` en
tu `.env`.

**El navegador devuelve 403 en endpoints autenticados.**
El JWT no tiene el rol esperado o expiro. Vuelve a iniciar sesion. Si solo
afecta a algunos endpoints (ej. `/tutoria/disponibles` para TUTORADO), puede
ser una regla de seguridad del backend; revisa los issues abiertos en el
repo del backend.

**El puerto 5173 esta ocupado.**
Vite escogera automaticamente el siguiente disponible. Revisa la salida de
`npm run dev` para la URL real (5174, 5175, etc.).

**Cambios en `.env` no se reflejan.**
Vite solo lee `.env` al arrancar. Detiene el servidor (`Ctrl+C`) y vuelve a
ejecutar `npm run dev`.

**`Encountered two children with the same key`.**
Indica que el backend devuelve items sin id estable. Verifica que el endpoint
correspondiente este devolviendo el shape enriquecido (ver issues del
backend).
