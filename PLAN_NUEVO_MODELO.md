# Plan de implementacion - Nuevo modelo y mockups (oct 2026)

Plan para reconstruir el frontend sobre el nuevo modelo del backend (tutorias recurrentes con
horarios semanales, inscripciones, sesiones y pase de lista) siguiendo las 16 pantallas de los
mockups de escritorio del 5 oct 2026.

**Fuentes**

- Mockups: `Mockups_SistemaDeTutorias.pdf` (16 pantallas; mismo contenido que el archivo de Figma).
- Contrato del backend: `TutoriasBackend/docs` (`API.md`, `REGLAS_DE_NEGOCIO.md`,
  `AUTENTICACION.md`, `MODELO_DE_DATOS.md`) mas los ajustes pedidos al backend
  (ver [Contrato con el backend](#contrato-con-el-backend)).

Las casillas `[ ]` sirven para llevar el avance directamente en este archivo.

## Indice

- [Decisiones](#decisiones)
- [Contrato con el backend](#contrato-con-el-backend)
- [Rutas](#rutas)
- [Reglas de trabajo](#reglas-de-trabajo)
- [Fase 0 - Preparacion](#fase-0---preparacion)
- [Fase 1 - Capa de datos](#fase-1---capa-de-datos)
- [Fase 2 - Acceso y layout por rol](#fase-2---acceso-y-layout-por-rol)
- [Fase 3 - Tutorado](#fase-3---tutorado)
- [Fase 4 - Tutor](#fase-4---tutor)
- [Fase 5 - Administracion](#fase-5---administracion)
- [Fase 6 - Limpieza, documentacion y PR](#fase-6---limpieza-documentacion-y-pr)
- [Disenos propios](#disenos-propios)
- [Componentes compartidos](#componentes-compartidos)
- [Invalidacion de cache](#invalidacion-de-cache)
- [Dependencias con el backend](#dependencias-con-el-backend)
- [Riesgos y mitigacion](#riesgos-y-mitigacion)
- [Checklist de pruebas manuales](#checklist-de-pruebas-manuales)
- [Resumen de esfuerzo](#resumen-de-esfuerzo)

---

## Decisiones

| Tema                      | Decision                                                                                                                                                                                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                   | Se programa contra el contrato documentado como si ya estuviera desplegado en `https://tutoriasbe.onrender.com`. En desarrollo se llega por el proxy de Vite; en produccion, por `VITE_API_URL`.                                                                                         |
| Datos simulados           | No hay modo simulado en el navegador. MSW se usa solo en las pruebas (Vitest), con los ejemplos de `API.md`.                                                                                                                                                                             |
| Pantallas sin mockup      | Se disenan aqui con el estilo y los componentes de los mockups (ver [Disenos propios](#disenos-propios)).                                                                                                                                                                                |
| Entrega                   | Una rama `feat/nuevo-modelo` y un solo PR a `main`, con commits por fase y por pantalla. Se fusiona cuando el backend este desplegado. La rama sale de `refactor/estructura-por-features`, que tiene 31 commits que aun no llegan a `main` (PRs apilados #12 a #17): el PR los incluira. |
| Rutas                     | Se conservan las rutas actuales del tutor y del tutorado y se agregan las nuevas. El admin vive en `/administracion/...` porque `/admin` es un prefijo del proxy hacia el backend (recargar la pagina mandaria la peticion al backend).                                                  |
| Dias                      | Solo lunes a viernes: el backend rechaza sabado y domingo. Se corrige la pantalla 10.                                                                                                                                                                                                    |
| Horas                     | Se muestran en 24 h (`10:00 – 12:00`). Los formularios usan `<input type="time">`: el navegador decide si lo muestra en 12 o 24 h y se envia `HH:mm`.                                                                                                                                    |
| Zona horaria              | "hoy", "mañana" y las fechas relativas se calculan en `America/Mexico_City`, igual que el backend.                                                                                                                                                                                       |
| Boton de Google           | Se usa el boton oficial (`GoogleLogin` con `text="continue_with"` y tema `outline`): Google Identity Services solo entrega el ID token desde su propio boton. Se ve casi igual al mockup.                                                                                                |
| Asistencia baja           | En la pantalla 15 se marca con ⚠ cuando es menor a 80 %.                                                                                                                                                                                                                                 |
| "Bajas desde"             | La pantalla 15 manda `desde` = inicio del periodo escolar actual (1 de febrero o 1 de agosto).                                                                                                                                                                                           |
| Encabezado de los mockups | La franja azul superior con el numero de pantalla ("03 · TUTORADO") es del documento de mockups, no de la app. No se implementa.                                                                                                                                                         |
| Responsivo                | Los mockups son de escritorio. Se conserva el comportamiento movil actual (menu lateral desplegable, rejillas que se apilan y tablas con scroll horizontal).                                                                                                                             |

---

## Contrato con el backend

Se implementa `API.md` tal cual (rutas, nombres de campos y envoltura `{ success, message, data }`)
mas estos ajustes pedidos al backend, que se dan por hechos:

1. El login de Microsoft acepta tambien cuentas `@uv.mx` (admin y personal academico).
2. Los errores de un campo llegan con formato de validacion:
   `data: { nrc }` en `POST/PUT /materias` y `data: { matricula }` en `POST /auth/registro`.
3. `Sesion.inscritos` en sesiones `CANCELADA` = inscritos activos en el momento de cancelar.
4. `panelTutorado.choques` tiene la misma forma que los `choques` de `GET /tutorias`:
   `{ dia, horaInicio, horaFin, conTutoria: { idTutoria, materia, horaInicio, horaFin } }`.
5. Cada elemento de `tutorados` en `GET /tutorias/{id}/historial-asistencia` trae `fechaInscripcion`.

Todo el acceso a la API vive en `src/api/`: si el backend se desvia del contrato, se corrige ahi.

---

## Rutas

| #       | Pantalla                                           | Ruta                                 | Rol                             |
| ------- | -------------------------------------------------- | ------------------------------------ | ------------------------------- |
| 01      | Iniciar sesion                                     | `/login`                             | invitado                        |
| 02      | Completar registro                                 | `/registro`                          | invitado con registro pendiente |
| 03      | Explorar tutorias                                  | `/tutorado/home`                     | tutorado                        |
| 04 - 06 | Detalle, confirmar inscripcion y estados del panel | `/tutorado/tutorias/:id`             | tutorado                        |
| 07      | Mis tutorias                                       | `/tutorado/inscripciones`            | tutorado                        |
| 08      | Mi asistencia                                      | `/tutorado/inscripciones/:idTutoria` | tutorado                        |
| 09      | Mis tutorias y sesiones de hoy                     | `/tutor/home`                        | tutor                           |
| 10      | Crear tutoria                                      | `/tutor/tutorias/nueva`              | tutor                           |
| -       | Editar tutoria (diseno propio)                     | `/tutor/tutorias/:id/editar`         | tutor                           |
| 11      | Detalle de tutoria                                 | `/tutor/tutorias/:id`                | tutor                           |
| 12 - 13 | Pase de lista y cierre                             | `/tutor/sesiones/:idSesion/lista`    | tutor                           |
| 14      | Historial de asistencia                            | `/tutor/historial?tutoria=:id`       | tutor                           |
| 15      | Tutorias de la facultad                            | `/administracion/tutorias`           | admin                           |
| 16      | Experiencias Educativas                            | `/administracion/experiencias`       | admin                           |

`/tutor/horarios` (disponibilidad del tutor) desaparece con el nuevo modelo y redirige a `/tutor/home`.

---

## Reglas de trabajo

1. **Migracion por pantallas (strangler).** La capa actual se mueve a `src/api/legacy/` y la nueva
   nace en `src/api/` con sus nombres definitivos. Cada pantalla se reescribe contra la capa nueva y
   en la Fase 6 se borra todo lo del modelo anterior.
2. **Cada commit** pasa `npm run lint`, `npm run build` y `npm run test:run`, y usa Conventional
   Commits en espanol.
3. **Los DTOs se usan tal como vienen.** El contrato esta documentado, asi que no hay mappers
   defensivos; el formato para mostrar vive en `utils/formatters.js`.
4. **Pruebas por pantalla** con React Testing Library y MSW, usando fixtures tomados de `API.md`.
5. **Se reutiliza lo que ya existe:** componentes de `components/ui`, `Pagina`, `AppLayout`,
   `Sidebar`, `AuthLayout`, `Comentarios`, `TemasInput`, `useAhora`, `ejecutarMutacion` y `avisar`.

---

## Fase 0 - Preparacion

Objetivo: rama, configuracion y piezas base, sin cambiar pantallas.

- [x] Crear `feat/nuevo-modelo` desde `refactor/estructura-por-features`.
- [x] `vite.config.js`: el proxy apunta por defecto a `https://tutoriasbe.onrender.com` (se puede
      cambiar con `VITE_BACKEND_URL`) y cubre los prefijos nuevos: `/auth`, `/usuarios`,
      `/materias`, `/catalogos`, `/tutorias`, `/horarios`, `/temas`, `/inscripciones`, `/sesiones`,
      `/comentarios` y `/admin`. Se quitan `/materia`, `/horario`, `/tutoria` y `/asistencia`.
- [x] `.env.example`, `.env.production` y `render.yaml`: `VITE_BACKEND_URL` con la URL de Render y
      las variables `VITE_MICROSOFT_CLIENT_ID`, `VITE_MICROSOFT_TENANT_ID` y `VITE_GOOGLE_CLIENT_ID`
      (los Client IDs son publicos; quedan vacios hasta recibirlos).
- [x] Dependencias: `@azure/msal-browser` y `@react-oauth/google`.
- [x] Constantes del dominio (`constants/tutoria.js`, `constants/horarios.js`): cupo de 7,
      2 inasistencias permitidas, 15 minutos para cancelar, 10 temas de 60 caracteres y comentarios
      de 255; estados de tutoria, horario, inscripcion, sesion, panel del tutorado y `miAsistencia`;
      dias `LUNES` a `VIERNES` con sus etiquetas (`LUN`, `Lunes`).
- [x] Formateadores (`utils/formatters.js`, `utils/fechas.js`): rango de horas, dias de los
      horarios ("Lunes y miércoles", "Lun y mié"), lugar ("Edificio 2 · Aula 7" y "E2 · Aula 7"),
      fechas cortas y largas ("Mié 7 oct", "miércoles 7 de octubre"), fechas relativas en la zona de
      Mexico ("hoy", "mañana"), lugares disponibles ("3 lugares", "Último lugar", "Llena") e inicio
      del periodo escolar.
- [x] `ApiError` expone `errores` (mapa `campo → mensaje`) para mostrar el error bajo su campo.

**Pruebas:** formateadores, fechas en la zona de Mexico, inicio de periodo y `ApiError.errores`.

**Commits:** `build: apuntar el proxy de desarrollo al backend de render`,
`feat: agregar constantes y formateadores del nuevo modelo`.

> Hecho. El proxy usa una sola expresion (`^/(auth|usuarios|...)(/|?|$)`) que exige el
> segmento completo: asi `/administracion` no se confunde con `/admin`.

---

## Fase 1 - Capa de datos

Objetivo: todo el contrato de `API.md` disponible y probado antes de tocar pantallas.

- [x] Mover `auth.js`, `tutorias.js`, `asistencia.js`, `horarios.js`, `materias.js`, `temas.js`,
      `comentarios.js`, `mappers.js` y `queryKeys.js` a `src/api/legacy/` (solo `git mv` e imports).
      `client.js` se queda en `src/api/`.
- [x] Modulos nuevos en `src/api/`:

  | Modulo             | Funciones                                                                                                          | Endpoints                                                |
  | ------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
  | `auth.js`          | `microsoft`, `google`, `completarRegistro`                                                                         | `POST /auth/microsoft`, `/auth/google`, `/auth/registro` |
  | `usuarios.js`      | `actual`                                                                                                           | `GET /usuarios/me`                                       |
  | `materias.js`      | `listar`, `crear`, `actualizar`, `eliminar`                                                                        | `/materias`                                              |
  | `catalogos.js`     | `edificios`                                                                                                        | `GET /catalogos/edificios`                               |
  | `tutorias.js`      | `explorar`, `detalle`, `mias`, `crear`, `actualizar`, `desactivar`, `inscritos`, `sesiones`, `historialAsistencia` | `/tutorias/**`                                           |
  | `temas.js`         | `agregar`, `eliminar`                                                                                              | `POST /horarios/{id}/temas`, `DELETE /temas/{id}`        |
  | `inscripciones.js` | `inscribirse`, `mias`, `deTutoria`, `darseDeBaja`, `semana`                                                        | `/inscripciones/**`                                      |
  | `sesiones.js`      | `hoy`, `abrirLista`, `cancelar`, `lista`, `guardarMarcas`, `cerrarLista`                                           | `/sesiones/**`                                           |
  | `comentarios.js`   | `deTutoria`, `publicar`, `eliminar`                                                                                | `/tutorias/{id}/comentarios`, `DELETE /comentarios/{id}` |
  | `admin.js`         | `resumen`, `tutorias`, `tutores`, `cerrarPeriodo`                                                                  | `/admin/**`                                              |

- [x] `queryKeys.js` nuevo, con una raiz por dominio (`tutorias`, `inscripciones`, `sesiones`,
      `comentarios`, `materias`, `catalogos`, `usuario`, `admin`) para invalidar por grupo.
- [x] Fixtures en `src/test/fixtures/` con los ejemplos de `API.md` (incluidos los ajustes del
      contrato).

**Pruebas:** cada funcion arma bien la ruta, los query params y el body.

**Commits:** `feat(api): agregar el cliente del nuevo contrato` (incluye el movimiento a
`legacy/`, que se borro en la Fase 6).

---

## Fase 2 - Acceso y layout por rol

Pantallas 01 y 02, sesion y barra lateral.

- [x] **Proveedores** (`features/auth/proveedores/`):
  - Microsoft: `PublicClientApplication` de MSAL (`initialize()` y `loginPopup` con
    `openid profile email`); devuelve `idToken`. Usa una pagina de redireccion en blanco para el
    popup (`public/redirect.html`), segun la guia de la version instalada de MSAL.
  - Google: `GoogleOAuthProvider` y `GoogleLogin`; devuelve `credential`.
  - Ambos se cargan solo en la pantalla de login, que ya es lazy.
- [x] **AuthProvider:**
  - `entrarConProveedor(proveedor, idToken)`: si `registroPendiente`, guarda
    `{ tokenRegistro, perfil }` en `sessionStorage` (vence a los 15 minutos) y manda a `/registro`;
    si no, guarda la sesion `{ token, rol, matricula, nombre, correo }`.
  - `completarRegistro({ matricula, rol })`.
  - Se quitan `login`, `registro` y `actualizarNombre`. `storage.js` agrega `correo`.
- [x] **01 Iniciar sesion:** tarjeta dividida (`AuthLayout`) con "Bienvenido de vuelta" y sus 3
      beneficios, "Continuar con Microsoft", boton de Google, aviso "¿Es tu primera vez?" y la nota
      de correos. Los errores del backend (dominio no permitido, token invalido) van en un `Alert`.
      Se conserva el aviso de sesion expirada.
- [x] **02 Completar registro:** pasos del panel izquierdo ("Cuenta de Microsoft verificada",
      "Matrícula y rol", "Entrar a tu panel"); tarjeta con iniciales, nombre, correo e insignia del
      proveedor; matricula (zod acepta `zS…` y `s…` y la normaliza a `S` + 8 digitos); rol en tarjetas
      ("Tutorado · Quiero inscribirme a tutorías", "Tutor · Quiero impartir tutorías"); "Crear cuenta y
      continuar"; "¿No es tu cuenta? Entrar con otra" descarta el registro pendiente. La matricula
      duplicada se muestra bajo el campo. Si el `tokenRegistro` vencio, vuelve al login con aviso.
- [x] **Guardas:** `/registro` solo con registro pendiente.
- [x] **Layout:** menu de cada rol (se completa conforme llegan sus pantallas); tarjeta de usuario
      con iniciales, nombre, "Matrícula: …" y rol; datos frescos con `GET /usuarios/me`.
- [x] Toaster abajo a la derecha, como el aviso de la pantalla 07.

**Pruebas:** usuario registrado, registro pendiente, error de dominio, matricula duplicada,
`tokenRegistro` vencido, esquema de matricula y guardas.

**Commits:** `feat(auth): iniciar sesion con microsoft y google`,
`feat(layout): mostrar los datos del usuario en la barra lateral`.

> Hecho. MSAL v5 exige que la pagina de redireccion del popup llame a
> `broadcastResponseToMainFrame()`, asi que `redirect.html` es una entrada de Vite (no un
> archivo de `public/`) con `src/app/redirect.js`.

---

## Fase 3 - Tutorado

### 3.1 Componentes compartidos

- [x] `BarraCupo`, `HorariosSemana` (chips de dia con su horario), `Lugar`, `MedidorInasistencias`,
      `Avatar`, `EstadoBadge` (por tipo de estado) e iconos nuevos
      (ver [Componentes compartidos](#componentes-compartidos)).

### 3.2 Explorar tutorias (03)

- [x] `GET /tutorias` con `q` (buscador con espera de 300 ms), `dia` (chips Todos y Lun a Vie),
      `soloConLugar` y `ocultarChoques` (casillas). Los filtros viven en la URL para conservarlos al
      volver del detalle.
- [x] Conteo "8 tutorías disponibles".
- [x] Tarjeta: titulo, "Imparte …", insignia de lugares (verde "3 LUGARES", ambar "ÚLTIMO LUGAR",
      roja "LLENA"), horarios, lugar y barra de cupo (azul; naranja con 6 de 7; roja llena).
- [x] Aviso ambar de choque ("Se cruza con tu horario. El jueves choca con Bases de Datos (16:00 –
      18:00).").
- [x] Boton verde "Ver detalle e inscribirme →", o "Ver detalle" en contorno si esta llena o
      tiene choque.
- [x] Estados de carga, vacio y error.

### 3.3 Detalle (04), confirmar inscripcion (05) y estados del panel (06)

- [x] `GET /tutorias/{id}`, `GET /tutorias/{id}/comentarios` y `GET /inscripciones/semana`.
- [x] Encabezado ("IMPARTE", insignia ACTIVA o INACTIVA) y 4 datos: "Experiencia Educativa ·
      NRC 48215", lugar, "Horarios por semana · 2 sesiones de 2 horas" y proxima sesion.
- [x] Horarios y temas.
- [x] Comentarios: solo lectura con "Inscríbete para sugerir temas…"; con inscripcion activa se
      muestra el formulario.
- [x] Panel derecho segun `panelTutorado.estado`:
  - `CON_LUGAR`: cupo, beneficios y "Inscribirme".
  - `INSCRIPCION_ACTIVA`: proxima sesion, recordatorio, inasistencias y "Darme de baja".
  - `CHOQUE_HORARIO`: aviso con el detalle de `choques` y "Revisar mis tutorías".
  - `LLENA`: aviso de tutoria llena.
  - `NO_ACTIVA`: aviso y "Explorar otras tutorías".
  - `BAJA_AUTOMATICA`: fecha de la baja, inasistencias y "Explorar otras tutorías".
- [x] "Tu semana": une la semana del tutorado con los horarios de esta tutoria ("Esta tutoría" con
      borde punteado verde) y muestra la insignia "SIN CHOQUES" o "CHOQUE".
- [x] Modal 05 con horarios, lugar y el correo del usuario; `POST /inscripciones` lleva a Mis
      tutorias con el aviso "Inscripción confirmada".
- [x] Darse de baja con confirmacion.

### 3.4 Mis tutorias (07)

- [x] `GET /inscripciones`.
- [x] Tarjeta de proxima sesion: fecha en bloque ("MAR 6"), "PRÓXIMA SESIÓN · MAÑANA", temas del
      dia y "Recordatorio por correo a las 14:00".
- [x] Inscripciones activas: insignia NUEVA o ACTIVA, horarios, lugar, medidor de inasistencias,
      proxima sesion o "Primera sesión: …" y "Ver detalle y asistencia →".
- [x] Inscripciones anteriores: BAJA, BAJA AUTOMÁTICA y tutoria desactivada (diseno propio).
- [x] Estado vacio.

### 3.5 Mi asistencia (08)

- [x] `GET /inscripciones/tutorias/{id}`.
- [x] Historial de asistencia: se muestran las 6 sesiones mas recientes; "Ver las N sesiones →"
      despliega todas.
- [x] Horarios y temas.
- [x] Comentarios con formulario (contador 0/255) y borrado de los propios (insignia "TÚ").
- [x] Columna lateral: "Tu asistencia" (medidor, aviso y conteos), proxima sesion y "Darme de baja"
      con confirmacion, que lleva a Mis tutorias.
- [x] Si la inscripcion ya no esta activa, se ocultan el formulario y la baja.

**Pruebas:** filtros a query params; insignia y barra segun cupo; los 6 estados del panel; flujo de
inscripcion (confirmar, POST, navegacion y aviso); "Tu semana" con choque; Mis tutorias (activas y
anteriores); Mi asistencia (historial, conteos y baja); comentarios (contador y borrar el propio).

**Commits:** `feat(tutorias): agregar los componentes compartidos del nuevo modelo`,
`feat(tutorado): explorar, detalle, mis tutorias y mi asistencia`.

---

## Fase 4 - Tutor

### 4.1 Mis tutorias y sesiones de hoy (09)

- [x] `GET /sesiones/hoy` (se refresca cada minuto) y `GET /tutorias/mis-tutorias`.
- [x] Tarjetas de sesiones de hoy segun `estado` y `acciones`:
  - "Abrir pase de lista" (`POST /sesiones/abrir-lista`) lleva al pase de lista.
  - "Revisar y cerrar lista" lleva al pase de lista abierto.
  - "Cancelar sesión" con confirmacion.
  - Aviso "La sesión terminó…" con `terminada` y "Los tutorados recibirán el recordatorio a las …".
- [x] Listas sin cerrar de dias anteriores (diseno propio).
- [x] "Tus tutorías": insignia, NRC, horarios, lugar, barra de inscritos, aviso
      "1 tutorado ya tiene 2 inasistencias" o proxima sesion, y "Ver detalle →".
- [x] Boton "+ Crear tutoría".

### 4.2 Crear (10) y editar tutoria

- [x] react-hook-form con `useFieldArray`.
- [x] Experiencia Educativa (`GET /materias`), edificio y aula dependientes
      (`GET /catalogos/edificios`) y aviso "Cupo de 7 tutorados…".
- [x] Horarios: dia (Lun a Vie en botones), hora de inicio y de fin, temas con `TemasInput`
      (contador "26/60 caracteres · 2/10 temas" y texto "Los tutorados verán estos temas en las
      sesiones del martes."), "+ Agregar otro horario", quitar horario, "Limpiar" y "Crear tutoría".
- [x] Validacion zod: al menos un horario; inicio antes que fin; sin traslapes entre los horarios
      de la tutoria (RN-1: los contiguos no chocan); temas de 1 a 60 caracteres, maximo 10 y sin
      repetir.
- [x] Los errores del backend (choque con otra tutoria o con el aula) se muestran en un `Alert`.
- [x] Editar: el mismo formulario precargado, con la Experiencia Educativa bloqueada; `PUT` con
      `idHorario` en los horarios que se conservan.

### 4.3 Detalle de tutoria (11)

- [x] `GET /tutorias/{id}`, `/sesiones`, `/inscritos` y `/comentarios`.
- [x] Encabezado (EE, NRC, estado), horarios y lugar.
- [x] Lista de sesiones con el texto y la accion de cada estado:
  - "Recordatorio a los tutorados a las 08:00" con "Cancelar sesión".
  - "5 de 5 marcados · falta cerrar la lista" con "Ir al pase de lista".
  - "4 de 5 asistieron" con "Ver lista".
  - "Se avisó por correo a los 5 tutorados · no cuenta para inasistencias".
- [x] Enlace "Historial de asistencia →".
- [x] Horarios y temas editables: agregar con Enter o "+" y quitar con "×"
      (`POST /horarios/{id}/temas`, `DELETE /temas/{id}`).
- [x] Botones "Editar tutoría" y "Desactivar tutoría" (disenos propios).
- [x] Panel "Inscritos" con cupo, lista y "En riesgo de baja".
- [x] Comentarios de los tutorados (solo lectura).

### 4.4 Pase de lista (12) y cierre (13)

- [x] `GET /sesiones/{id}/lista`; encabezado con EE, fecha, horario y lugar.
- [x] Cada fila con "Asistió" y "No asistió": cada clic hace un `PUT` parcial y se pinta la
      respuesta. "Marcar a todos: asistió" envia a todos.
- [x] Aviso "Con esta inasistencia suma 3…" cuando `causaraBaja`.
- [x] Resumen (asistieron, no asistieron, sin marca) y panel de cierre con las 3 condiciones de
      `cierre`.
- [x] Modal 13 con los conteos y `bajasPrevistas`; `POST /sesiones/{id}/cerrar-lista` lleva al
      historial con el aviso de cierre.
- [x] Modo de solo lectura para sesiones completadas (diseno propio).

### 4.5 Historial de asistencia (14)

- [x] Selector de tutoria (`GET /tutorias/mis-tutorias?estado=TODAS`).
- [x] Aviso de cierre, que llega desde el pase de lista.
- [x] 4 indicadores: sesiones completadas, asistencia ("86 % · 30 de 35 marcas"), canceladas y
      bajas automaticas.
- [x] Matriz tutorado x sesion:
  - columna de sesion cancelada sombreada;
  - celdas ✓, × y × rellena para la inasistencia que causo la baja;
  - "—" para sesion cancelada y punto gris para "aún no inscrito" (con `fechaInscripcion`);
  - insignia "BAJA AUTOMÁTICA · 5 OCT" y columna "Asistió / faltó";
  - leyenda, primera columna fija y scroll horizontal.

**Pruebas:** botones de cada sesion segun `acciones`; validaciones del formulario (traslape, horas,
temas); body de crear y editar; temas en linea; pase de lista (marcar, marcar a todos, condiciones y
modal con bajas); matriz del historial.

**Commits:** `feat(tutor): sesiones de hoy, crear y editar, detalle, pase de lista e historial`.

---

## Fase 5 - Administracion

- [x] **Roles:** el admin deja de usar el panel del tutor; tiene su propio inicio
      (`/administracion/tutorias`) y su menu (Tutorías, Experiencias Educativas).
- [x] **15 Tutorias de la facultad:**
  - `GET /admin/resumen?desde=`, `GET /admin/tutorias` y `GET /admin/tutores`.
  - 4 indicadores.
  - Buscador con espera, filtro de tutor y filtro de estado ("Solo activas", "Inactivas",
    "Todas").
  - Tabla: EE + NRC, tutor, horarios, lugar, barra de cupo, asistencia (con ⚠ si es menor a 80 %)
    y estado.
  - Desactivar por fila y cierre de periodo (disenos propios).
  - Pie "11 tutorías activas · cupo fijo de 7 tutorados por tutoría".
- [x] **16 Experiencias Educativas:**
  - `GET /materias?q=`; tabla con NRC, nombre, tutorias activas y "Editar".
  - Panel "Agregar Experiencia Educativa" (nombre de hasta 100 caracteres, NRC entero positivo)
    con el error de NRC duplicado bajo el campo.
  - Editar y eliminar (disenos propios).

**Pruebas:** filtros a query params; formulario de EE (validaciones y error de campo del backend);
confirmaciones de desactivar y de cierre de periodo.

**Commits:** `feat(admin): tutorias de la facultad`, `feat(admin): catalogo de experiencias educativas`.

---

## Fase 6 - Limpieza, documentacion y PR

- [x] Borrar `src/api/legacy/`, `features/horarios/`, `AgregarHorario`, `constants/espacios.js`, la
      logica del modelo anterior en `utils/tutoria.js`, los componentes que ya no se usan
      (`AccionesTutoria`, `EditarTutoriaForm`, etc.), los esquemas de login y registro con
      contrasena, `PasswordInput` si queda sin uso, y sus pruebas.
- [x] `grep` sin referencias a las rutas viejas (`/tutoria/`, `/asistencia`, `/horario`,
      `/materia/`, `/auth/signin`).
- [x] README: funcionalidades, rutas, integracion con el backend, variables de entorno y
      configuracion de Microsoft y Google.
- [x] CHANGELOG en `[Sin publicar]`.
- [x] `npm run lint`, `npm run build` y `npm run test:run` en verde.
- [ ] Checklist manual contra Render, cuando el backend este desplegado.
- [ ] PR unico a `main`; se fusiona y despliega junto con el backend.

**Commits:** `refactor: eliminar el modelo anterior`, `docs: documentar el nuevo modelo`.

> Pendiente: el checklist manual y el PR dependen de que el backend despliegue la API nueva
> y de los Client IDs (ver [Dependencias con el backend](#dependencias-con-el-backend)).

---

## Disenos propios

Partes sin mockup, resueltas con el mismo estilo y componentes:

| Donde                     | Diseno                                                                                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 Error de login         | `Alert` rojo sobre los botones con el mensaje del backend ("Solo se permiten cuentas @estudiantes.uv.mx.").                                                                                                                                                 |
| 07 Tutoria desactivada    | Fila en "Inscripciones anteriores" con insignia gris "TUTORÍA DESACTIVADA" y el texto "La tutoría dejó de impartirse".                                                                                                                                      |
| 09 Listas sin cerrar      | Aviso ambar arriba de "Sesiones de hoy": "Tienes N pases de lista sin cerrar", con una fila por sesion (EE, fecha y horario) y "Ir al pase de lista".                                                                                                       |
| 10 Editar tutoria         | La pantalla 10 con titulo "Editar tutoría", EE bloqueada y boton "Guardar cambios".                                                                                                                                                                         |
| 11 Boton "Editar tutoría" | Deshabilitado si hay inscritos activos o una lista abierta, con el motivo debajo ("Solo puedes cambiar horarios o lugar sin tutorados inscritos. Los temas sí se pueden editar.").                                                                          |
| 11 Desactivar tutoria     | Boton "Desactivar tutoría" (contorno rojo) junto a "Editar tutoría". Modal: "Dejará de aceptar inscripciones y avisaremos por correo a los N inscritos. No se puede reactivar." Deshabilitado con lista abierta.                                            |
| 12 Ver lista (completada) | La pantalla 12 sin controles: cada fila con su marca, insignia "COMPLETADA" y sin panel de cierre.                                                                                                                                                          |
| 14 Aun no inscrito        | Celda con punto gris y entrada en la leyenda "Aún no estaba inscrito".                                                                                                                                                                                      |
| 15 Desactivar una tutoria | Columna final con boton pequeno "Desactivar" en las tutorias activas; mismo modal que en la 11.                                                                                                                                                             |
| 15 Cierre de periodo      | Boton "Cerrar periodo" (contorno rojo) en el encabezado. Modal con cuantas tutorias se desactivaran y la casilla "Entiendo que esta acción no se puede deshacer", que habilita "Cerrar periodo". Si hay listas abiertas, se muestra el mensaje del backend. |
| 16 Editar EE              | "Editar" cambia el panel derecho a "Editar Experiencia Educativa" con los datos precargados, "Cancelar" y "Guardar cambios".                                                                                                                                |
| 16 Eliminar EE            | En el panel de edicion, boton "Eliminar" (contorno rojo) con confirmacion. Si la EE tiene tutorias, se muestra el error del backend.                                                                                                                        |
| Listas vacias             | `EmptyState` existente: sin tutorias, sin inscripciones, sin sesiones hoy y sin comentarios.                                                                                                                                                                |

---

## Componentes compartidos

| Componente                | Que hace                                                                           | Pantallas                              |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| `BarraCupo`               | Barra con tono segun la ocupacion (azul, naranja con 6 de 7, roja llena)           | 03, 04, 06, 09, 11, 15                 |
| `HorariosSemana`          | Chips de dia (LUN, MIÉ) con su horario                                             | 03, 05, 07, 09                         |
| `Lugar`                   | Icono y "Edificio 2 · Aula 7"                                                      | 03, 04, 05, 07, 09                     |
| `MedidorInasistencias`    | 3 segmentos, el tercero punteado                                                   | 06, 07, 08                             |
| `Avatar`                  | Circulo con iniciales                                                              | 02, 04, 08, 11, 12, 13 y barra lateral |
| `Indicador`               | Etiqueta en mayusculas y numero grande                                             | 14, 15                                 |
| `Tabla`                   | Estilos de tabla con encabezados en mayusculas                                     | 08, 14, 15, 16                         |
| `EstadoBadge`             | Insignias de tutoria, sesion, inscripcion y cupo                                   | todas                                  |
| `Segmentado`              | Control "Asistió" / "No asistió"                                                   | 12                                     |
| `Comentarios` (se adapta) | Lista, formulario de 255, insignia "TÚ" y borrar                                   | 04, 08, 11                             |
| `TemasInput` (se adapta)  | Chips de temas con contador                                                        | 10, 11                                 |
| Iconos                    | Reloj, calendario, edificio, campana, correo, alerta, libro, usuarios y cuadricula | varias                                 |

---

## Invalidacion de cache

| Accion                             | Se refresca                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Inscribirse o darse de baja        | Explorar, detalle de la tutoria e inscripciones (mias, semana y mi asistencia) |
| Publicar o borrar comentario       | Comentarios de la tutoria                                                      |
| Crear, editar o desactivar tutoria | Tutorias del tutor, detalle, sesiones de hoy y administracion                  |
| Agregar o quitar tema              | Detalle de la tutoria                                                          |
| Abrir lista o cancelar sesion      | Sesiones de hoy, sesiones de la tutoria y tutorias del tutor                   |
| Marcar asistencia                  | Se escribe la respuesta del `PUT` en la cache de la lista                      |
| Cerrar lista                       | Sesiones, inscritos, historial, tutorias del tutor y administracion            |
| Alta, cambio o baja de EE          | Catalogo de EE                                                                 |
| Cierre de periodo                  | Todo lo de tutorias, sesiones y administracion                                 |

---

## Dependencias con el backend

- [ ] API documentada desplegada en `https://tutoriasbe.onrender.com`.
- [ ] Los 5 ajustes del [contrato](#contrato-con-el-backend).
- [ ] Microsoft: Client ID y tenant de la UV; redirect URIs tipo SPA `http://localhost:5173`,
      `http://localhost:5173/redirect.html` y sus equivalentes con el dominio del front en Render.
- [ ] Google: Client ID; origenes autorizados `http://localhost`, `http://localhost:5173` y el
      dominio del front; nuestros correos como test users.
- [ ] CORS para el dominio del front (header `Authorization` y metodos `PUT`, `PATCH` y `DELETE`).
- [ ] Un usuario ADMIN de prueba.
- [ ] Aviso cuando cambie alguna ruta, campo o regla.

---

## Riesgos y mitigacion

| Riesgo                                                                                      | Mitigacion                                                                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| No se puede probar de punta a punta hasta que el backend despliegue (no hay modo simulado). | Pruebas con MSW y los ejemplos de `API.md`; checklist manual al desplegar.                              |
| El backend se desvia del contrato.                                                          | Todo el acceso esta en `src/api/`: se ajusta en un solo lugar.                                          |
| Login bloqueado sin Client IDs o sin las URIs registradas.                                  | Pedirlos desde ya; las variables de entorno quedan listas.                                              |
| El PR unico es muy grande.                                                                  | Commits por fase y por pantalla, cada uno con lint, build y pruebas en verde.                           |
| Produccion rota si el front se publica antes que el backend, o al reves.                    | Fusionar y desplegar los dos al mismo tiempo.                                                           |
| Arranque en frio de Render (las instancias gratuitas tardan cerca de un minuto).            | Revisar el timeout de 15 s del cliente; si hace falta, subirlo o mostrar "El servidor está iniciando…". |
| La regla de reescritura de Render podria tapar `/redirect.html`.                            | Verificar que Render sirva el archivo antes de reescribir a `index.html`.                               |
| El boton de Google no es identico al mockup.                                                | Boton oficial con tema y texto ajustados.                                                               |

---

## Checklist de pruebas manuales

Contra `https://tutoriasbe.onrender.com`, cuando el backend este desplegado.

**Acceso**

- [ ] Entrar con Microsoft y con Google (usuario registrado) lleva al inicio de su rol.
- [ ] Primer acceso: completar registro como tutorado y como tutor; matricula duplicada; "Entrar con otra".
- [ ] Cuenta de otro dominio: se muestra el error del backend.
- [ ] Cerrar sesion y sesion expirada.

**Tutorado**

- [ ] Explorar con cada filtro; insignias y barras de cupo; aviso de choque.
- [ ] Detalle en los 6 estados del panel; "Tu semana".
- [ ] Inscribirse (confirmacion, correo y aviso); aparece en Mis tutorias como NUEVA.
- [ ] Mi asistencia: historial, comentarios (publicar y borrar) y darse de baja.

**Tutor**

- [ ] Crear tutoria con 2 horarios y temas; traslape y choque con el aula.
- [ ] Sesiones de hoy: abrir lista, cancelar y listas sin cerrar.
- [ ] Detalle: temas en linea, editar sin inscritos y desactivar.
- [ ] Pase de lista: marcar, marcar a todos, cerrar con baja automatica e historial.

**Admin**

- [ ] Indicadores, filtros y tabla; desactivar una tutoria; cierre de periodo.
- [ ] Alta, edicion, NRC duplicado y eliminacion de EE.

---

## Resumen de esfuerzo

| Fase                | Tamano | Commits |
| ------------------- | ------ | ------- |
| 0 - Preparacion     | S      | 2       |
| 1 - Capa de datos   | M      | 2       |
| 2 - Acceso y layout | M      | 3       |
| 3 - Tutorado        | L      | 5       |
| 4 - Tutor           | L      | 5       |
| 5 - Administracion  | M      | 2       |
| 6 - Limpieza y PR   | S      | 2       |
