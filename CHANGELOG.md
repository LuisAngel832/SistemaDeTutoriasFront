# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el
proyecto sigue [Versionado Semantico](https://semver.org/lang/es/).

## [Sin publicar]

> Requiere el backend con la API nueva (`TutoriasBackend/docs/API.md`): este front ya no
> funciona con la API anterior.

### Agregado

- Nuevo modelo de tutorias (mockups de escritorio del 5 oct 2026): tutorias recurrentes con
  horarios semanales y temas por horario, inscripciones, sesiones, pase de lista e historial.
- Inicio de sesion con Microsoft y Google (MSAL y Google Identity Services) y registro en el
  primer acceso con matricula y rol.
- Tutorado: explorar con filtros, panel de inscripcion con sus seis estados, "Tu semana",
  Mis tutorias con la proxima sesion y Mi asistencia con historial, comentarios y baja.
- Tutor: sesiones de hoy (abrir pase de lista, cancelar, listas sin cerrar), crear y editar
  tutorias con varios horarios, detalle con temas en linea y desactivar, pase de lista con
  cierre y bajas automaticas, e historial de asistencia en matriz.
- Panel de administracion: tutorias de la facultad con indicadores, desactivar y cierre de
  periodo, y catalogo de Experiencias Educativas.
- TanStack Query para los datos del servidor: cache entre pantallas, reintentos controlados
  e invalidacion automatica despues de cada operacion.
- Validacion de formularios con react-hook-form y Zod: cada error se muestra junto a su campo
  y el formulario se envia con Enter.
- Avisos flotantes (sonner) para el resultado de las acciones: crear o eliminar un horario,
  inscribirse, comentar, completar o cancelar una tutoria.
- Sistema de diseno: tokens de color, sombras y radios, animaciones compartidas y componentes
  base reutilizables (botones, campos, alertas, dialogos, tarjetas).
- Pruebas automatizadas con Vitest, Testing Library y MSW (se ejecutan en el CI).
- Cliente HTTP unico con timeout, cancelacion y mensajes de error uniformes.
- Contexto de autenticacion: la sesion se cierra al vencer el token o ante un 401 y el login
  avisa que la sesion expiro; despues de iniciar sesion se vuelve a la pagina pedida.
- Paginas 404 y de error, titulo de pestana por pagina y barra de carga entre paginas.
- Carga diferida de cada pagina.
- Prettier, Husky (lint-staged y commitlint), workflow de CI en GitHub Actions y Dependabot.
- Modulos compartidos `utils/` (formatters, fechas, reglas de tutoria) y `constants/`.
- Tipografia Montserrat cargada con Fontsource y metadatos para buscadores y redes sociales.
- `CONTRIBUTING.md`, `CHANGELOG.md` y plantilla de pull request.

### Cambiado

- El proxy de desarrollo apunta por defecto al backend de Render y reenvia los recursos de la
  API nueva.
- El administrador tiene su propio panel en lugar de usar el del tutor.
- Los avisos flotantes aparecen abajo a la derecha.
- Interfaz unificada: todas las pantallas usan los mismos componentes; los emojis decorativos
  se reemplazan por iconos SVG y los textos llevan acentuacion correcta.
- Accesibilidad: contraste AA en textos y botones, radios nativos para elegir rol y dia,
  dialogos de confirmacion con <dialog> (foco y Escape) y avisos anunciados por lectores de
  pantalla. Sin hallazgos de axe en las 10 pantallas.
- URLs nuevas: `/tutor/tutorias/nueva`, `/tutor/horarios`, `/tutor/tutorias/:id`,
  `/tutorado/inscripciones` y `/tutorado/tutorias/:id`. Las anteriores redirigen a estas.
- Los listados ya no muestran el estado de carga despues de crear o eliminar un elemento.
- Codigo organizado por features (`auth`, `tutorias`, `horarios`, `comentarios`, `tutor`,
  `tutorado`) con el alias `@` para los imports; se elimina la carpeta `pages/` y los
  imports relativos profundos.
- La confirmacion de "tutoria creada" ya no abre una ventana modal: es un aviso con enlace
  a "Mis tutorias".

### Corregido

- El rol `admin` era redirigido a `/login` al iniciar sesion.
- La fecha minima de los formularios se calculaba en UTC y bloqueaba el dia actual por la noche.
- Un error del backend al inscribirse podia mostrarse como exito.
- Al editar una tutoria se perdia el horario seleccionado.
- "Marcar como completada" y "Cancelar tutoria" se ofrecian aunque el backend los rechazaria.
- El nombre del tutor no aparecia en las inscripciones del tutorado.
- No se reconocian los comentarios propios, por lo que no se podian eliminar.

### Eliminado

- Login y registro con contrasena, horarios de disponibilidad del tutor ("Mis horarios") y
  la tutoria de una sola fecha, con su capa de API, componentes y utilidades.
- Archivos sin uso del template de Vite.

## [0.1.0]

Version inicial previa al plan de mejoras: autenticacion, panel del tutor (tutorias,
horarios, detalle con temas, inscritos y comentarios) y panel del tutorado (explorar,
inscripciones, detalle con comentarios).
