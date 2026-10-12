# Puntos de mejora y refactorizacion

Analisis del frontend del Sistema de Tutorias (React 19 + Vite 8 + React Router 7).
El objetivo es listar cambios concretos que hagan el proyecto mas mantenible,
robusto y profesional. Cada punto indica **que pasa hoy**, **por que importa** y
**como resolverlo**, con referencias a archivos.

> Estado al momento del analisis: ~8,800 lineas en `src/` (≈3,000 JSX, ≈5,800 CSS),
> 0 tests, 0 errores y 8 warnings de ESLint, sin CI.

## Resumen por prioridad

| #   | Punto                                                                   | Prioridad | Esfuerzo |
| --- | ----------------------------------------------------------------------- | --------- | -------- |
| 1   | Bugs detectados (rol admin, fecha UTC, deteccion de exito por texto)    | Alta      | Bajo     |
| 2   | Cliente HTTP centralizado (`api/`)                                      | Alta      | Medio    |
| 3   | Manejo de sesion: 401/token expirado, contexto de auth                  | Alta      | Medio    |
| 4   | Eliminar duplicacion (formatters, constantes, `TutoriaCard`, info-grid) | Alta      | Bajo     |
| 5   | Sistema de diseno en CSS (variables, componentes base)                  | Media     | Medio    |
| 6   | Capa de datos con cache (TanStack Query)                                | Media     | Medio    |
| 7   | Formularios y validacion                                                | Media     | Medio    |
| 8   | Estructura de carpetas y convenciones de nombres                        | Media     | Bajo     |
| 9   | Router: rutas anidadas, lazy loading, 404                               | Media     | Bajo     |
| 10  | Testing (Vitest + Testing Library + MSW)                                | Media     | Medio    |
| 11  | Calidad automatizada (Prettier, Husky, CI)                              | Media     | Bajo     |
| 12  | Accesibilidad                                                           | Media     | Bajo     |
| 13  | TypeScript                                                              | Baja      | Alto     |
| 14  | Configuracion, despliegue y documentacion                               | Baja      | Bajo     |

---

## 1. Bugs detectados (arreglar primero)

### 1.1 El rol `admin` queda en un loop hacia `/login`

[useAutentificacion.jsx:84](src/hooks/useAutentificacion.jsx#L84) navega a `/tutor/home`
cuando el rol es `admin`, pero [AppRouter.jsx:37](src/Routes/AppRouter.jsx#L37) solo
permite `['tutor']`. `PrivateRoute` lo manda a `/login` aun teniendo token valido.

**Solucion:** agregar `'admin'` a `allowedRoles` de las rutas de tutor, o crear su
propio panel. Centralizar el mapa `rol -> ruta inicial` en una sola constante
(hoy esta repetido en `AppRouter` y en `useAutentificacion`).

### 1.2 `min` de la fecha calculado en UTC

`new Date().toISOString().split('T')[0]` en
[FormCrearTutoria.jsx:23](src/pages/Tutor/CrearTutoria/FormCrearTutoria.jsx#L23) y
[TutoriaDetalle.jsx:188](src/pages/Tutor/TutoriaDetalle/TutoriaDetalle.jsx#L188)
devuelve la fecha **UTC**. En Mexico (UTC-6), despues de las 18:00 el minimo
permitido ya es "manana" y el tutor no puede crear una tutoria para hoy.

```js
// utils/fechas.js
export const hoyLocalISO = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}
```

### 1.3 Deteccion de exito buscando texto en el mensaje

[Tutorado/TutoriaDetalle.jsx:93](src/pages/Tutorado/TutoriaDetalle.jsx#L93) decide si
la inscripcion fue exitosa buscando `"no fue posible"` o `"error"` en el mensaje. Si el
backend responde "No hay cupo", se muestra como **exito**.

**Solucion:** que `useTutoriaDetalleTutorado` devuelva `{ ok, message }`, igual que ya
hace `useTutoriaDetalleTutor`. Unificar el contrato de retorno en todos los hooks.

### 1.4 Al editar una tutoria el horario se pierde

Al pulsar "Editar tutoria" se ejecuta `setIdHorario('')`
([TutoriaDetalle.jsx:435](src/pages/Tutor/TutoriaDetalle/TutoriaDetalle.jsx#L435)) y el
efecto que precarga el formulario no incluye el horario. El usuario siempre debe
volver a elegirlo o el guardado falla con "Completa todos los campos". Ademas,
`Number('')` es `0`, que **si** pasa `Number.isFinite`, por lo que se podria enviar
`idHorario: 0`.

**Solucion:** precargar `idHorario` desde `tutoria` al entrar en modo edicion (en el
`onClick`, no en un `useEffect`, lo que tambien elimina el warning de lint) y validar
con `!valor` antes de convertir a numero.

### 1.5 Otros detalles

- `response.json()` sin `.catch` en [useCrearTutoria.jsx:76](src/hooks/useCrearTutoria.jsx#L76)
  y [useTutoriasExplorar.jsx:28](src/hooks/useTutoriasExplorar.jsx#L28): si el backend
  responde sin cuerpo (ej. 204 o 500 HTML) se muestra "Error al conectar con el servidor".
- `console.log` de depuracion en [useTutoriaDetalleTutorado.jsx:25](src/hooks/useTutoriaDetalleTutorado.jsx#L25)
  que expone las inscripciones en la consola de produccion.
- `handleLimpiar` en [CrearTutoria.jsx:38](src/pages/Tutor/CrearTutoria/CrearTutoria.jsx#L38)
  recorre los temas llamando `quitarTema` uno por uno; el hook deberia exponer un `reset()`.
- La fuente `Montserrat` se declara en [index.css](src/index.css) pero nunca se carga
  (no hay `<link>` a Google Fonts ni `@font-face`), asi que cada equipo ve una fuente distinta.
- El texto "Los inscritos seran notificados" al cancelar promete algo que el frontend
  no puede garantizar; confirmar con el backend o quitarlo.

---

## 2. Cliente HTTP centralizado

**Hoy:** cada uno de los 9 hooks redefine `BASE_URL`, `getAuthHeaders` y (en 3 de ellos)
`fetchJson`. La logica de "parsear JSON, leer `message`, fallback de error" se repite
~25 veces con variaciones.

**Propuesta:** una carpeta `src/api/` con un cliente unico y servicios por recurso.

```js
// src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Error al conectar con el servidor', 0)
  }

  const json = await response.json().catch(() => null)

  if (response.status === 401) onUnauthorized() // ver punto 3
  if (!response.ok || json?.success === false) {
    throw new ApiError(json?.message || 'Ocurrio un error inesperado', response.status, json)
  }
  return json?.data
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  delete: (p) => request(p, { method: 'DELETE' }),
}
```

```js
// src/api/tutorias.js
export const tutoriasApi = {
  misTutorias: () => api.get('/tutoria/mis-tutorias'),
  disponibles: () => api.get('/tutoria/disponibles'),
  detalle: (id) => api.get(`/tutoria/${id}`),
  crear: (payload) => api.post('/tutoria', payload),
  actualizar: (id, payload) => api.put(`/tutoria/${id}`, payload),
  cancelar: (id) => api.delete(`/tutoria/${id}`),
  completar: (id) => api.put(`/tutoria/completar/${id}`),
}
```

**Beneficios:** un solo lugar para headers, errores, 401, timeouts y logging; los
hooks quedan en 10-20 lineas; los servicios se pueden mockear en tests.

### Normalizadores de datos

Los "adaptadores" de shapes inconsistentes del backend estan dispersos:
`h.idHorario ?? h.id ?? h.idHorarios ?? h.horarioId` (dos veces), `normalizar` en
[MisTutorias.jsx](src/pages/Tutorado/MisTutorias.jsx), `findInscripcion` con 4 candidatos
de id, `tema.tema || tema.nombre || String(tema)` (5 veces). Moverlos a
`src/api/mappers.js` para que los componentes siempre reciban el mismo shape.
Idealmente, abrir issues en el backend para estabilizar los DTOs y borrar estos fallbacks.

---

## 3. Sesion y autenticacion

**Problemas actuales:**

- Token, rol, matricula y nombre se leen de `localStorage` directamente en al menos 6
  archivos (30 accesos). No hay una unica fuente de verdad.
- **No se maneja el token expirado.** Si el JWT caduca, cada pantalla muestra su error
  generico y el usuario sigue "logueado" en la UI.
- `AppRouter` lee `localStorage` en cada render para decidir la ruta `/`.
- `useAutentificacion` recibe `setError` como parametro: mezcla la logica del hook con
  el estado del componente. Es mejor que devuelva/lance el error.
- `logout` borra `correo`, que nunca se guarda.

**Propuesta:**

1. `AuthContext` + `useAuth()` que exponga `{ user, token, rol, login, logout, isAuthenticated }`.
   Reemplaza `utils/sesion.js` y el evento custom `sesion-actualizada`.
2. Un modulo `storage.js` con claves en constantes (`STORAGE_KEYS.TOKEN`, etc.).
3. Decodificar el `exp` del JWT al cargar y en `PrivateRoute`; si expiro, cerrar sesion.
4. En el cliente HTTP, ante un `401`, limpiar sesion y redirigir a
   `/login?expired=1` para mostrar "Tu sesion expiro".
5. Tras el login, redirigir a la ruta que el usuario intentaba abrir
   (`location.state.from`).
6. Considerar (junto con el backend) cookies `httpOnly` en lugar de `localStorage`
   para mitigar robo del token por XSS.

---

## 4. Duplicacion de codigo

| Duplicado                                             | Copias | Destino sugerido                                     |
| ----------------------------------------------------- | ------ | ---------------------------------------------------- |
| `formatFecha` / `formatHora`                          | 5      | `src/utils/formatters.js`                            |
| `ESTADO_CLASS` + logica de estado                     | 4      | `src/constants/tutoria.js` + `<EstadoBadge>`         |
| Tarjeta de tutoria (`TutoriaCard`, `Card`)            | 3      | `<TutoriaCard variant>`                              |
| Grid de info con iconos (fecha/horario/edificio/aula) | 2      | `<TutoriaInfoGrid>`                                  |
| Input de temas (`TemasInput` vs `TemaQuickInput`)     | 2      | Un solo `<TemasInput>` con prop `compact`            |
| Opciones de edificio (1-2) y aula (1-16) hardcodeadas | 2      | `src/constants/espacios.js` (idealmente del backend) |
| Lista de horarios `dia · hh:mm - hh:mm`               | 3      | `formatHorario(h)`                                   |
| Bloque de confirmacion (texto + Volver/Si)            | 3      | `<ConfirmInline>` o `<ConfirmDialog>`                |
| Skeletons de carga, estados vacio y error             | 6+     | `<Skeleton>`, `<EmptyState>`, `<Alert>`              |
| Paginas Login y Registro (panel de marca)             | 2      | `<AuthLayout>`                                       |
| `MAX_CARACTERES_TEMA = 60`                            | 2      | `constants/tutoria.js`                               |

[TutoriaDetalle.jsx del tutor](src/pages/Tutor/TutoriaDetalle/TutoriaDetalle.jsx) tiene
586 lineas; tras extraer `TutoriaInfoGrid`, `TemasEditor`, `EditarTutoriaForm`,
`AccionesCard` e `InscritosList` deberia quedar por debajo de 150.

---

## 5. Estilos: sistema de diseno

**Hoy:** ~5,800 lineas de CSS plano, **sin una sola variable CSS**. Los mismos colores se
repiten decenas de veces (`#ffffff` x70, `#1c2a44` x54, `#2d5fa7` x32...). Cada pagina
redefine sus propios botones, chips, skeletons y animaciones con prefijos distintos
(`tdt-`, `td-`, `ex-`, `mt-`, `cmt-`...): hay **28 `@keyframes`**, casi todos variantes de
`fade-in`, `shimmer` y `spin`. Los archivos responsive estan separados y con nombres
inconsistentes (`Login_respon.css`, `agregarHorarioR.css`, `crearTutoriaR.css`).

Como las clases son globales, cualquier nombre repetido entre paginas (`btn-aceptar`,
`btn-secundario`, `form-label`) puede pisar estilos de otra vista.

**Propuesta (incremental):**

1. `src/styles/tokens.css` con variables:
   ```css
   :root {
     --color-primary: #2d5fa7;
     --color-primary-hover: #1f5aab;
     --color-text: #1c2a44;
     --color-text-muted: #5b6778;
     --color-border: #d4dae4;
     --color-danger: #a4252f;
     --color-danger-bg: #fbe5e7;
     --radius-md: 12px;
     --shadow-card: 0 1px 2px rgb(16 24 40 / 6%);
     --space-2: 0.5rem;
     --space-4: 1rem;
     --space-6: 1.5rem;
   }
   ```
2. `src/styles/animations.css` con 3-4 keyframes compartidos.
3. Componentes base en `src/components/ui/`: `Button`, `Card`, `Badge`, `Chip`, `Input`,
   `Select`, `Alert`, `Skeleton`, `Spinner`, `Modal`, cada uno con su CSS.
4. Migrar a **CSS Modules** (`Button.module.css`) para evitar colisiones globales; Vite lo
   soporta sin configuracion. Alternativa: Tailwind CSS si el equipo prefiere utilidades.
5. Media queries dentro del mismo archivo del componente, con breakpoints como
   constantes documentadas.
6. Reemplazar emojis usados como iconos (📅 🕐 🏛️ 🚪 🔍) por SVG del mismo set que
   [icons.jsx](src/components/layout/icons.jsx) (o `lucide-react`): se ven igual en todos
   los sistemas operativos.
7. Cargar la tipografia correctamente (`@fontsource/montserrat` o Google Fonts).

---

## 6. Capa de datos y estado del servidor

Los hooks manejan a mano `isLoading/error/data`, recargan todo despues de cada mutacion
y no cancelan peticiones al desmontar (posibles `setState` sobre componentes
desmontados y condiciones de carrera al cambiar de `:id`). Tambien generan los 7
warnings `react-hooks/set-state-in-effect`, que hoy se silencian bajando la regla a `warn`
en [eslint.config.js](eslint.config.js).

**Propuesta:** adoptar **TanStack Query** (`@tanstack/react-query`).

```js
export const useMisTutorias = () =>
  useQuery({ queryKey: ['tutorias', 'mias'], queryFn: tutoriasApi.misTutorias })

export const useCancelarTutoria = (id) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => tutoriasApi.cancelar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutorias'] }),
  })
}
```

Aporta cache entre pantallas (volver de un detalle no vuelve a pedir la lista),
reintentos, cancelacion, `isPending` por mutacion (hoy un solo `isSubmitting` bloquea
todos los botones de la pagina) y elimina los warnings de lint. Tras migrar, regresar la
regla de ESLint a `error`.

---

## 7. Formularios y validacion

- `useCrearTutoria` tiene un `useState` por campo y expone 20 valores/setters que se
  pasan por 3 niveles (prop drilling hacia `FormCrearTutoria`).
- La validacion es imperativa y los errores se muestran en un modal generico, no junto al
  campo que fallo.
- Los formularios usan `type="button"` + `onClick` en lugar de `onSubmit`, por lo que
  **Enter no envia** y los atributos `required` no se aplican.
- `Registro` no valida formato de correo ni de matricula antes de llamar al backend.

**Propuesta:** `react-hook-form` + `zod` con esquemas en `src/schemas/`
(`tutoriaSchema`, `horarioSchema`, `registroSchema`), mensajes de error por campo con
`aria-invalid` / `aria-describedby`, y un `<FormField>` reutilizable. Sustituir el modal de
resultado por notificaciones tipo toast (`sonner` o un `ToastProvider` propio).

---

## 8. Estructura de carpetas y convenciones

**Inconsistencias actuales:**

- Carpetas: `Routes/` (mayuscula) vs `hooks/`, `utils/`; `LogIn/` vs `Registro/`.
- Paginas: algunas en carpeta propia (`Tutor/CrearTutoria/`), otras sueltas
  (`Tutor/Home.jsx`, `Tutorado/TutoriaDetalle.jsx`).
- CSS: `login.css`, `Login_respon.css`, `homeTutorado.css`, `tutoriaDetalleTutor.css`.
- Hooks con extension `.jsx` aunque no contienen JSX; mezcla de `export default` y
  `export const` (`useTutoriasExplorar`, `useTutoriasTutorado`).
- Typo: `VentanaEmerjente` → `VentanaEmergente` (o simplemente `Modal`).
- `components/Tutor/TemasInput` no es exclusivo del tutor.
- Espanglish mezclado: `isLoading`, `handleSubmit`, `showModal` junto a `cargar`,
  `eliminandoId`, `recargar`, `refetch`. Elegir un criterio (p. ej. codigo en ingles,
  textos de UI en espanol) y aplicarlo.
- Restos del template de Vite: `src/App.css` vacio, `src/assets/react.svg` vacio,
  `vite.svg`, `hero.png`, `public/icons.svg` sin uso.

**Estructura sugerida (por features):**

```
src/
  app/            # main.jsx, App.jsx, providers, router
  api/            # client.js, tutorias.js, horarios.js, mappers.js
  features/
    auth/         # LoginPage, RegistroPage, AuthLayout, useAuth, AuthContext
    tutorias/     # TutoriaCard, TutoriaInfoGrid, EstadoBadge, TemasInput, hooks
    horarios/
    comentarios/
    tutor/pages/
    tutorado/pages/
  components/
    ui/           # Button, Card, Alert, Modal, Skeleton...
    layout/       # AppLayout, Sidebar
  constants/
  styles/         # tokens.css, animations.css, global.css
  utils/          # formatters.js, fechas.js
```

Agregar alias de imports en `vite.config.js` (`@/components/...`) para eliminar rutas
como `../../../components/layout/AppLayout`.

---

## 9. Router

- Cada ruta repite `<PrivateRoute allowedRoles={[...]}>` y cada pagina envuelve su
  contenido en `<AppLayout>`. Con **rutas anidadas** y `<Outlet />` se declara una vez:
  ```jsx
  <Route element={<RequireRole roles={['tutor', 'admin']} />}>
    <Route element={<AppLayout />}>
      <Route path="/tutor" element={<TutorHome />} />
      <Route path="/tutor/tutorias/nueva" element={<CrearTutoria />} />
    </Route>
  </Route>
  ```
- Rutas en un archivo de constantes (`ROUTES.TUTOR_HOME`) en lugar de strings sueltos.
- URLs inconsistentes: `/tutorado/infoTutoria/:id` (camelCase) vs
  `/tutor/agregar-horario`. Sugerido: `/tutorado/tutorias/:id`, `/tutor/horarios`.
- `React.lazy` + `Suspense` por pagina para dividir el bundle.
- Pagina 404 real en vez de redirigir silenciosamente a `/`.
- `ErrorBoundary` global para no mostrar una pantalla en blanco ante un error de render.
- Actualizar `document.title` por pagina.

---

## 10. Testing

No existe ningun test. Propuesta minima:

- **Vitest + React Testing Library + jsdom** para unit/componentes.
- **MSW** para simular el backend en tests (y opcionalmente en desarrollo sin backend).
- Prioridad de cobertura:
  1. `utils/formatters`, `utils/fechas`, mappers (funciones puras, rapido y alto valor).
  2. Cliente HTTP: manejo de 401, errores y cuerpos vacios.
  3. `PrivateRoute` / redireccion por rol.
  4. Flujos: login, crear tutoria, inscribirse/cancelar (regla de 15 minutos).
- **Playwright** para 2-3 flujos end-to-end criticos mas adelante.

Scripts: `"test": "vitest"`, `"test:coverage": "vitest run --coverage"`.

---

## 11. Calidad automatizada

- **Prettier** + `eslint-config-prettier`; hoy el estilo es consistente a mano, pero no
  esta garantizado.
- Plugins de ESLint: `eslint-plugin-jsx-a11y` (accesibilidad) y `eslint-plugin-import`
  (orden de imports, imports no usados).
- **Husky + lint-staged**: lint/format en `pre-commit`; **commitlint** para reforzar los
  Conventional Commits que ya usa el README.
- **GitHub Actions** (`.github/workflows/ci.yml`): `npm ci` → `lint` → `test` → `build` en
  cada PR hacia `develop` y `main`.
- Plantillas de PR e issues en `.github/`.
- `"engines": { "node": ">=20.19" }` en `package.json` y un `.nvmrc`.
- Renombrar `"name": "sistemadetutorias1"` y ajustar `"version"` (hoy `0.0.0`); llevar un
  `CHANGELOG.md`.
- Dependabot o Renovate para mantener dependencias al dia.

---

## 12. Accesibilidad

- El modal [VentanaEmerjente](src/components/Tutor/VentanaEmerjente.jsx) no tiene
  `role="dialog"`, `aria-modal`, foco inicial, trampa de foco ni cierre con Escape.
  Usar `<dialog>` nativo o un componente accesible.
- Los mensajes de feedback/error no se anuncian: agregar `role="alert"` (errores) o
  `aria-live="polite"` (exito).
- `radiogroup` hechos con botones (rol en registro, dias en horarios) no soportan
  navegacion con flechas; usar `<input type="radio">` estilizados.
- Estados de carga: `aria-busy` en contenedores con skeleton.
- Toda la card de tutoria del tutor es un `<Link>` que envuelve un `<article>` con
  encabezados; revisar que el nombre accesible del enlace sea legible.
- Revisar contraste de textos grises (`#8a93a3` sobre blanco no llega a 4.5:1).
- Textos sin acentos ("Tutorias", "Contrasena", "Matricula", "sesion"): en una
  aplicacion para usuarios finales deberian llevar ortografia correcta (el archivo esta
  en UTF-8 y `lang="es"`).

---

## 13. TypeScript (a mediano plazo)

Gran parte del codigo defensivo actual (`?.`, `??`, multiples nombres de id) existe
porque no hay contratos de datos. Migrar a TypeScript de forma gradual:

1. `tsconfig.json` con `allowJs` + `checkJs`.
2. Tipar primero `api/` (`Tutoria`, `Horario`, `Inscripcion`, `ApiResponse<T>`).
3. Convertir hooks y componentes compartidos; las paginas al final.

Si el backend publica OpenAPI (springdoc), generar los tipos automaticamente con
`openapi-typescript`.

---

## 14. Configuracion, despliegue y documentacion

- La lista de prefijos del proxy en [vite.config.js](vite.config.js) debe mantenerse a mano
  cada vez que el backend agrega un recurso. Si el backend expone todo bajo `/api`,
  bastaria un solo proxy.
- `VITE_API_URL` esta definido tanto en `.env.production` como en `render.yaml`; dejar una
  sola fuente para evitar que diverjan.
- Validar variables de entorno al arrancar (fallar rapido si falta `VITE_API_URL` en build
  de produccion).
- Agregar headers de seguridad en Render (`Content-Security-Policy`,
  `X-Frame-Options`, `Referrer-Policy`) y cache largo para `/assets/*`.
- `index.html`: agregar `meta description`, Open Graph y `apple-touch-icon`.
- **README desactualizado:** menciona `components/Tutor/Header.jsx`,
  `components/Tutorado/HeaderTR.jsx` y "Header con menu hamburguesa", que ya fueron
  reemplazados por `layout/AppLayout` + `Sidebar`. Actualizar la seccion de estructura.
- Agregar capturas de pantalla o un GIF al README y un `CONTRIBUTING.md`.
- El enlace a `issues/8` del backend esta hardcodeado en
  [MisTutorias.jsx](src/pages/Tutorado/MisTutorias.jsx); los avisos tecnicos no deberian
  mostrarse al usuario final. Mover a un log o eliminar cuando el backend lo resuelva.

---

## Plan de trabajo sugerido

1. **Sprint 1 — Estabilizar:** punto 1 (bugs), punto 4 (utils y constantes), limpiar restos
   del template, actualizar README, Prettier + CI basico.
2. **Sprint 2 — Base tecnica:** cliente HTTP y mappers (2), `AuthContext` con manejo de 401 (3),
   rutas anidadas y lazy loading (9), primeros tests de utils y cliente (10).
3. **Sprint 3 — UI consistente:** tokens CSS, componentes `ui/`, CSS Modules (5),
   accesibilidad del modal y feedback (12).
4. **Sprint 4 — Escalar:** TanStack Query (6), react-hook-form + zod (7), reestructura por
   features (8).
5. **Despues:** TypeScript gradual (13) y tests end-to-end.

Cada sprint puede ir en su propia rama (`refactor/api-client`, `refactor/design-tokens`, ...)
con PRs pequenos hacia `develop`, siguiendo la convencion actual del repositorio.
