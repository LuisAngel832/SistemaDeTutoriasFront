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

Sigue los mockups de escritorio del 5 oct 2026 (16 pantallas) y el contrato de la API
documentado en el backend (`docs/API.md`). El plan de la migracion esta en
[docs/PLAN_NUEVO_MODELO.md](docs/PLAN_NUEVO_MODELO.md).

### Acceso

- Inicio de sesion con correo o matricula y contrasena; el backend entrega un JWT.
- Registro con nombre, apellidos, matricula (`S` + 8 digitos), correo, contrasena y rol
  (tutorado o tutor).
- Redireccion al panel de cada rol: tutorado, tutor o administrador.

### Panel del tutorado

- Explorar tutorias con busqueda, filtro por dia, "solo con lugares" y "ocultar las que se
  cruzan con mis horarios" (los filtros se guardan en la URL).
- Detalle de tutoria con horarios y temas, comentarios, "Tu semana" y el panel de inscripcion
  en sus seis estados (con lugar, inscrito, choque, llena, no activa y baja automatica).
- Mis tutorias: proxima sesion, inscripciones activas con sus inasistencias e inscripciones
  anteriores.
- Mi asistencia: historial por sesion, comentarios para el tutor y baja voluntaria.

### Panel del tutor

- Sesiones de hoy (abrir pase de lista, cancelar, listas sin cerrar) y tutorias activas.
- Crear y editar tutorias con varios horarios semanales y sus temas.
- Detalle con sesiones, temas editables, inscritos en riesgo, comentarios y desactivar.
- Pase de lista con marcas al momento y cierre con las bajas automaticas previstas.
- Historial de asistencia: indicadores y matriz tutorado por sesion.

### Panel de administracion

- Tutorias de la facultad: indicadores, filtros, cupo y asistencia por tutoria, desactivar
  una tutoria y cierre de periodo.
- Catalogo de Experiencias Educativas: alta, edicion y eliminacion.

### Interfaz

- Diseno responsive con breakpoints para escritorio, tablet y movil.
- Sidebar lateral colapsable (se recuerda la preferencia) y drawer con menu hamburguesa en
  pantallas pequenas.
- Tema visual unificado con tokens de diseno (paleta azul/verde) y animaciones sutiles.
- Accesibilidad: contraste AA, radios y dialogos nativos, mensajes anunciados a lectores de
  pantalla y soporte para `prefers-reduced-motion`.

## Stack

| Capa               | Tecnologia                                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| Build & dev server | [Vite](https://vitejs.dev/) 8                                                 |
| UI                 | [React](https://react.dev/) 19                                                |
| Routing            | [react-router-dom](https://reactrouter.com/) 7                                |
| Datos del servidor | [TanStack Query](https://tanstack.com/query) 5 (cache, reintentos)            |
| Formularios        | [react-hook-form](https://react-hook-form.com/) 7 + [Zod](https://zod.dev/) 4 |
| Avisos             | [sonner](https://sonner.emilkowal.ski/) (toasts de las acciones)              |
| Pruebas            | Vitest + Testing Library (jsdom) y MSW                                        |
| Lint               | ESLint 10 con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`     |
| Formato            | Prettier 3 + lint-staged (pre-commit) y commitlint (commit-msg)               |
| Lenguaje           | JavaScript (JSX)                                                              |
| Estilos            | CSS por componente con tokens de diseno y tipografia Montserrat               |

## Requisitos

- **Node.js 22.12+** (Vite 8 y commitlint lo requieren). El repo incluye `.nvmrc`:
  con nvm basta ejecutar `nvm use`.
- **npm 10+** (incluido con Node).
- El [backend del Sistema de Tutorias](https://github.com/Shtven/TutoriasBackend). Por defecto
  el proxy de desarrollo apunta al desplegado en `https://tutoriasbe.onrender.com`.

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

| Variable           | Default                           | Descripcion                                                                                             |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`     | (vacio)                           | URL absoluta del backend. **Dejar vacio para usar el proxy de Vite** (recomendado en desarrollo).       |
| `VITE_BACKEND_URL` | `https://tutoriasbe.onrender.com` | URL a la que Vite reenvia las peticiones en desarrollo (`http://localhost:8080` para un backend local). |

Variables sensibles (tokens, secretos) no se almacenan en este repo. El `.env`
local esta listado en `.gitignore`.

## Scripts disponibles

| Comando                 | Descripcion                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Levanta el servidor de desarrollo con HMR en `http://localhost:5173` (o el siguiente puerto disponible). |
| `npm run build`         | Compila a produccion en la carpeta `dist/`.                                                              |
| `npm run preview`       | Sirve el `dist/` localmente para probar el build.                                                        |
| `npm run analizar`      | Compila y genera `dist/estadisticas.html` con el peso de cada modulo (gzip incluido).                    |
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

En desarrollo el front evita CORS reenviando las peticiones a traves del proxy de Vite
([`vite.config.js`](vite.config.js)) hacia `VITE_BACKEND_URL`. Se reenvian los recursos de la
API: `/auth`, `/usuarios`, `/materias`, `/catalogos`, `/tutorias`, `/horarios`, `/temas`,
`/inscripciones`, `/sesiones`, `/comentarios` y `/admin`.

La regla exige el segmento completo (`/admin/...`), asi que rutas del front como
`/administracion` no se reenvian. Las rutas nuevas del front no deben empezar con esos
prefijos.

## Despliegue en Render (Static Site)

El front se despliega como **Static Site** en Render usando el blueprint
[`render.yaml`](render.yaml):

| Parametro         | Valor                             |
| ----------------- | --------------------------------- |
| Build command     | `npm ci && npm run build`         |
| Publish directory | `dist`                            |
| Rewrite (SPA)     | `/*` -> `/index.html`             |
| Auto-deploy       | `checksPass` (tras pasar la CI)   |
| `VITE_API_URL`    | `https://tutoriasbe.onrender.com` |

Pasos:

1. En Render: **New + > Blueprint** y selecciona este repositorio. Render lee
   `render.yaml` y crea el servicio con la configuracion anterior.
   - Alternativa manual: **New + > Static Site**, build `npm ci && npm run build`,
     publish `dist`, agrega la env var `VITE_API_URL` y la regla de _rewrite_.
2. La URL de produccion del backend se toma de [`.env.production`](.env.production)
   (versionado, sin secretos) y/o de la env var `VITE_API_URL` de Render. Se
   incrusta en el bundle durante el build.
3. Render despliega un commit de `main` solo cuando pasan sus checks de GitHub
   (`autoDeployTrigger: checksPass`). En un servicio creado antes de este ajuste, comprobar en
   **Settings > Build & Deploy > Auto-Deploy** que diga **After CI Checks Pass** (o sincronizar
   el blueprint).

> **Importante — CORS:** en produccion **no existe el proxy de Vite**, así que el
> navegador llama al backend en `https://tutoriasbe.onrender.com` desde otro
> origen. El backend de Spring Boot debe habilitar CORS para el dominio del
> Static Site (ej. `https://tutorias-frontend.onrender.com`), de lo contrario las
> peticiones seran bloqueadas por el navegador.

### Cabeceras de seguridad

`render.yaml` envia `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` y una CSP. La CSP esta en modo **Report-Only**: el navegador muestra
en la consola lo que bloquearia, sin bloquearlo.

- Para probarlas en local: `npm run build` y `npm run preview`, que aplica las mismas
  cabeceras (`CABECERAS_SEGURIDAD` en `vite.config.js`). Si se cambia una, cambiar la otra.
- Si cambia la URL del backend, actualizar `connect-src` en ambos archivos.
- Cuando la consola no muestre violaciones en ningun rol, renombrar la cabecera a
  `Content-Security-Policy` para que se aplique.

### Monitoreo de errores

Con `VITE_SENTRY_DSN` (Sentry o GlitchTip) se reportan los errores de render y de carga de
paginas (`PaginaError`), los de consultas y mutaciones de React Query y los no capturados. No
se reportan los 4xx, las cancelaciones ni los fallos de red del usuario. El `release` es el
SHA del commit (`RENDER_GIT_COMMIT`). Sin DSN no se descarga el SDK. No se envian datos del
usuario, cabeceras (el token), cuerpos de peticiones ni parametros de URL
([`src/app/monitoreo.js`](src/app/monitoreo.js)). Con GlitchTip u otro host, agregar su
dominio a `connect-src` de la CSP.

## Estructura del proyecto

Cada carpeta de `features/` reune la interfaz, los hooks y el estado de un dominio; lo que
usan varias features vive en `components/`, `utils/` o `constants/`. Los imports entre
carpetas usan el alias `@` (`@/components/ui`), definido en `vite.config.js` y `jsconfig.json`.

```
src/
  app/                     # Arranque, rutas y proveedores globales
    main.jsx               # Punto de entrada (lo carga index.html)
    router.jsx             # Rutas, carga diferida, redirecciones y paginas de error
    RaizApp.jsx            # Raiz: sesion, titulo del documento y barra de navegacion
    providers.jsx          # TanStack Query, avisos (sonner) y devtools en desarrollo
    queryClient.js         # Configuracion de cache y reintentos
    PaginaError.jsx        # Pantalla de error; NoEncontrada.jsx es el 404
  api/                     # Cliente HTTP, un modulo por recurso de la API y claves de cache
  components/
    layout/                # AppLayout (sidebar + contenido), Sidebar y Pagina
    ui/                    # Componentes base: Button, Card, FormField, Modal, Indicador... (CSS Modules)
  constants/               # Rutas, roles, reglas y estados del negocio, dias habiles
  features/
    auth/                  # AuthProvider, guards, storage, JWT y pages/ (login y registro)
    comentarios/           # Comentarios de una tutoria y su hook
    tutorias/              # Piezas compartidas: cupo, horarios, temas, insignias, detalle
    tutorado/              # Pantallas 03 a 08 con sus componentes y hooks
    tutor/                 # Pantallas 09 a 14 con sus componentes y hooks
    admin/                 # Pantallas 15 y 16 con sus hooks
  schemas/                 # Validacion de formularios con Zod (registro, tutoria, EE)
  styles/
    tokens.css             # Colores, sombras y radios (unica fuente de valores de diseno)
    animations.css         # Animaciones compartidas y reduccion de movimiento
    global.css             # Estilos base del documento
  test/                    # Setup de Vitest, servidor MSW, fixtures y helpers de render
  utils/
    avisos.js              # Muestra { ok, message } como toast
    choques.js             # Textos de los choques de horario
    cupo.js                # Insignia y tono de la barra de cupo
    ejecutarMutacion.js    # Ejecuta una mutacion y devuelve { ok, message }
    fechas.js              # Fechas en la zona de Mexico, "hoy/manana" e inicio de periodo
    formatters.js          # Formato de fechas, horarios, lugares, porcentajes e iniciales
```

## Rutas principales

Las rutas se definen en [`src/app/router.jsx`](src/app/router.jsx) y sus URLs en
[`src/constants/routes.js`](src/constants/routes.js). Cada pagina se descarga solo al visitarla.

| Ruta                                 | Rol      | Pantalla                                         |
| ------------------------------------ | -------- | ------------------------------------------------ |
| `/login`                             | publico  | 01 Iniciar sesion                                |
| `/registro`                          | publico  | 02 Crear cuenta                                  |
| `/tutorado/home`                     | TUTORADO | 03 Explorar tutorias                             |
| `/tutorado/tutorias/:id`             | TUTORADO | 04 a 06 Detalle, inscripcion y estados del panel |
| `/tutorado/inscripciones`            | TUTORADO | 07 Mis tutorias                                  |
| `/tutorado/inscripciones/:idTutoria` | TUTORADO | 08 Mi asistencia                                 |
| `/tutor/home`                        | TUTOR    | 09 Mis tutorias y sesiones de hoy                |
| `/tutor/tutorias/nueva`              | TUTOR    | 10 Crear tutoria                                 |
| `/tutor/tutorias/:id`                | TUTOR    | 11 Detalle de tutoria                            |
| `/tutor/tutorias/:id/editar`         | TUTOR    | Editar tutoria (sin inscritos)                   |
| `/tutor/sesiones/:idSesion/lista`    | TUTOR    | 12 y 13 Pase de lista y cierre                   |
| `/tutor/historial?tutoria=:id`       | TUTOR    | 14 Historial de asistencia                       |
| `/administracion/tutorias`           | ADMIN    | 15 Tutorias de la facultad                       |
| `/administracion/experiencias`       | ADMIN    | 16 Experiencias Educativas                       |

- `RequireRole` redirige a `/login` si no hay sesion (y vuelve a la ruta pedida despues del
  login) o a la pantalla inicial del usuario si su rol no corresponde.
- Con sesion activa, `/login` y `/registro` redirigen al inicio del rol.
- Las URLs anteriores (`/tutor/crear`, `/tutor/horarios`, `/tutor/agregar-horario`,
  `/tutor/tutoria/:id`, `/tutorado/tutorias`, `/tutorado/infoTutoria/:id`) redirigen a las
  nuevas.
- Las rutas desconocidas muestran una pagina 404 y los errores inesperados una pagina de error
  con opcion de reintentar.

## Integracion con el backend

El contrato es el de `TutoriasBackend/docs/API.md`, salvo el acceso. Todas las llamadas usan
el JWT del backend en el header `Authorization: Bearer <token>` (salvo `/auth/**`).

Acceso con contrasena (en lugar de Microsoft y Google):

- `POST /auth/signin` con `{ matricula, pwd }` o `{ correo, pwd }` (el front envia `correo`
  si lo escrito lleva `@`). Respuesta: `{ token, usuario }`; tambien acepta `{ token, rol }`
  y toma la matricula del claim `sub` del token.
- `POST /auth/signup` con `{ nombre, apellidos, matricula, correo, pwd, rol }` (`rol`:
  `TUTORADO` o `TUTOR`). Si responde `{ token, usuario }` entra directo; si no, manda al login.
  La matricula o el correo duplicados se muestran bajo su campo si llegan como
  `data: { matricula }` o `data: { correo }`.

- **Cliente HTTP** ([`src/api/client.js`](src/api/client.js)): agrega el token, aplica un
  timeout de 15 s, convierte los errores en `ApiError` con el mensaje del backend (y los
  errores por campo en `errores`) y cancela peticiones al desmontar las pantallas.
- **Modulos por recurso** (`src/api/*.js`): `auth`, `usuarios`, `materias`, `catalogos`,
  `tutorias`, `temas`, `inscripciones`, `sesiones`, `comentarios` y `admin`. Los DTOs se usan
  tal como llegan; el formato para mostrar vive en `src/utils/formatters.js`.
- **Sesion** ([`src/features/auth`](src/features/auth)): `AuthProvider` guarda token, rol,
  matricula, nombre y correo (en `localStorage`). La sesion se cierra y se avisa al usuario cuando el token vence (segun
  su `exp`) o el backend responde `401`.

Wrapper de respuesta esperado del backend:

```json
{ "success": true, "message": "...", "data": {} }
```

Ajustes al contrato que el front da por hechos: errores de NRC duplicado con formato de
validacion (`data: { nrc }`),
`Sesion.inscritos` en sesiones canceladas, `panelTutorado.choques` con la forma de los
`choques` de explorar y `fechaInscripcion` en el historial de asistencia.

## Contribuir

Las convenciones de ramas, commits, codigo y el checklist de cada PR estan en
[CONTRIBUTING.md](CONTRIBUTING.md). El plan del nuevo modelo esta en
[docs/PLAN_NUEVO_MODELO.md](docs/PLAN_NUEVO_MODELO.md) y el de las mejoras anteriores en
[docs/PLAN_IMPLEMENTACION.md](docs/PLAN_IMPLEMENTACION.md). La auditoria tecnica del frontend y su seguimiento estan en
[docs/AUDITORIA_FRONTEND.md](docs/AUDITORIA_FRONTEND.md).

## Solucion de problemas comunes

**El navegador devuelve 502 al pegarle al backend.**
El proxy de Vite no puede alcanzar el backend. Verifica `VITE_BACKEND_URL` en tu `.env`. En
Render, la primera peticion tras un rato sin uso puede tardar mientras el servicio arranca.

**El navegador devuelve 403 en endpoints autenticados.**
El JWT no tiene el rol esperado o expiro. Vuelve a iniciar sesion. Si solo
afecta a algunos endpoints, revisa la matriz de permisos de `docs/API.md` en el backend.

**El puerto 5173 esta ocupado.**
Vite escogera automaticamente el siguiente disponible. Revisa la salida de
`npm run dev` para la URL real (5174, 5175, etc.).

**Cambios en `.env` no se reflejan.**
Vite solo lee `.env` al arrancar. Detiene el servidor (`Ctrl+C`) y vuelve a
ejecutar `npm run dev`.
