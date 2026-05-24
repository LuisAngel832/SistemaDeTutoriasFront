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
- [Proxy de desarrollo y CORS](#proxy-de-desarrollo-y-cors)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas principales](#rutas-principales)
- [Integracion con el backend](#integracion-con-el-backend)
- [Convenciones de commits y ramas](#convenciones-de-commits-y-ramas)
- [Solucion de problemas comunes](#solucion-de-problemas-comunes)

## Funcionalidades

### Autenticacion
- Registro de usuarios con rol Tutor o Tutorado (matricula como identificador).
- Inicio de sesion con JWT y redireccion automatica al panel correspondiente.
- Toggle de mostrar/ocultar contrasena, validacion de longitud minima.

### Panel del Tutor
- Listado de tutorias propias con estado, fecha, horario, lugar y temas.
- Creacion de tutorias: seleccion de materia (cargada del back), horario, fecha,
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
- Explorar tutorias disponibles con buscador por materia o tutor.
- Detalle de tutoria con inscripcion y cancelacion (la cancelacion respeta la
  regla del backend: hasta 15 min antes de inicio).
- Zona de comentarios para sugerir temas u observaciones previas a la sesion.
- Listado de inscripciones propias.

### Interfaz
- Diseno responsive con breakpoints para escritorio, tablet y movil.
- Header con menu hamburguesa y drawer lateral en pantallas pequenas.
- Tema visual unificado (paleta azul/verde) con animaciones sutiles.
- Soporte para `prefers-reduced-motion`.

## Stack

| Capa | Tecnologia |
| --- | --- |
| Build & dev server | [Vite](https://vitejs.dev/) 8 |
| UI | [React](https://react.dev/) 19 |
| Routing | [react-router-dom](https://reactrouter.com/) 7 |
| Lint | ESLint 10 con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh` |
| Lenguaje | JavaScript (JSX) |
| Estilos | CSS plano por componente |

## Requisitos

- **Node.js 20.19+** o **22.12+** (requerido por Vite 8).
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

| Variable | Default | Descripcion |
| --- | --- | --- |
| `VITE_API_URL` | (vacio) | URL absoluta del backend. **Dejar vacio para usar el proxy de Vite** (recomendado en desarrollo). Si la defines, la app la usa como prefijo en todas las llamadas a la API. |
| `VITE_BACKEND_URL` | `http://localhost:8080` | URL a la que Vite proxea las peticiones en desarrollo. Solo aplica si `VITE_API_URL` queda vacio. |

Variables sensibles (tokens, secretos) no se almacenan en este repo. El `.env`
local esta listado en `.gitignore`.

## Scripts disponibles

| Comando | Descripcion |
| --- | --- |
| `npm run dev` | Levanta el servidor de desarrollo con HMR en `http://localhost:5173` (o el siguiente puerto disponible). |
| `npm run build` | Compila a produccion en la carpeta `dist/`. |
| `npm run preview` | Sirve el `dist/` localmente para probar el build. |
| `npm run lint` | Ejecuta ESLint sobre todo el codigo. |

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

## Estructura del proyecto

```
src/
  Routes/
    AppRouter.jsx          # Configuracion de rutas y proteccion por rol
    PrivateRoute.jsx       # HOC que valida token y rol antes de renderizar
  assets/
    css/components/        # CSS compartido (header, etc.)
  components/
    Comentarios.jsx        # Componente reusable de comentarios (RF15)
    Tutor/
      Header.jsx           # Header del tutor con drawer mobile
      TemasInput.jsx       # Input de chips para temas (RF14)
    Tutorado/
      HeaderTR.jsx         # Header del tutorado con drawer mobile
  hooks/
    useAutentificacion.jsx # Login, signup y logout
    useComentarios.jsx     # CRUD de comentarios sobre una tutoria
    useCrearTutoria.jsx    # Estado y submit de crear tutoria
    useHorarios.jsx        # CRUD de horarios del tutor
    useMisTutorias.jsx     # Tutorias del tutor autenticado
    useTutoriaDetalleTutor.jsx     # Detalle, edicion, cancel, completar, temas
    useTutoriaDetalleTutorado.jsx  # Detalle + inscripcion + cancelacion
    useTutoriasExplorar.jsx        # Listado de tutorias disponibles
    useTutoriasTutorado.jsx        # Inscripciones del tutorado
  pages/
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
```

## Rutas principales

| Ruta | Rol | Pantalla |
| --- | --- | --- |
| `/login` | publico | Inicio de sesion |
| `/registro` | publico | Registro |
| `/tutor/home` | TUTOR | Mis tutorias |
| `/tutor/crear` | TUTOR | Crear tutoria |
| `/tutor/agregar-horario` | TUTOR | Gestionar horarios |
| `/tutor/tutoria/:id` | TUTOR | Detalle de tutoria (editar, cancelar, ver inscritos) |
| `/tutorado/home` | TUTORADO | Explorar tutorias |
| `/tutorado/tutorias` | TUTORADO | Mis inscripciones |
| `/tutorado/infoTutoria/:id` | TUTORADO | Detalle de tutoria (inscribirse, cancelar, comentar) |

`PrivateRoute` redirige a `/login` si no hay token o el rol no corresponde.

## Integracion con el backend

El backend espera autenticacion JWT en el header `Authorization: Bearer <token>`.
El front lee el token de `localStorage` (clave `token`) despues del login.

Endpoints consumidos:

- `POST /auth/signup`, `POST /auth/signin`
- `GET/POST/PUT/DELETE /horario`, `GET /horario/{id}`
- `GET /materia` (cargado de la lista de materias para crear tutoria)
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

## Convenciones de commits y ramas

- Commits en formato [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `chore:`, `build:`, `docs:`, etc.).
- Ramas con prefijo segun proposito: `feat/`, `fix/`, `chore/`, `docs/`.
- Las ramas de feature se abren contra `develop`. Despues de QA, `develop` se
  promueve a `main`.

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
