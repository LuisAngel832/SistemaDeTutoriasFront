# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el
proyecto sigue [Versionado Semantico](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- TanStack Query para los datos del servidor: cache entre pantallas, reintentos controlados
  e invalidacion automatica despues de cada operacion.
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

- Interfaz unificada: todas las pantallas usan los mismos componentes; los emojis decorativos
  se reemplazan por iconos SVG y los textos llevan acentuacion correcta.
- Accesibilidad: contraste AA en textos y botones, radios nativos para elegir rol y dia,
  dialogos de confirmacion con <dialog> (foco y Escape) y avisos anunciados por lectores de
  pantalla. Sin hallazgos de axe en las 10 pantallas.
- URLs nuevas: `/tutor/tutorias/nueva`, `/tutor/horarios`, `/tutor/tutorias/:id`,
  `/tutorado/inscripciones` y `/tutorado/tutorias/:id`. Las anteriores redirigen a estas.
- Los listados ya no muestran el estado de carga despues de crear o eliminar un elemento.

### Corregido

- El rol `admin` era redirigido a `/login` al iniciar sesion.
- La fecha minima de los formularios se calculaba en UTC y bloqueaba el dia actual por la noche.
- Un error del backend al inscribirse podia mostrarse como exito.
- Al editar una tutoria se perdia el horario seleccionado.
- "Marcar como completada" y "Cancelar tutoria" se ofrecian aunque el backend los rechazaria.
- El nombre del tutor no aparecia en las inscripciones del tutorado.
- No se reconocian los comentarios propios, por lo que no se podian eliminar.

### Eliminado

- Archivos sin uso del template de Vite.

## [0.1.0]

Version inicial previa al plan de mejoras: autenticacion, panel del tutor (tutorias,
horarios, detalle con temas, inscritos y comentarios) y panel del tutorado (explorar,
inscripciones, detalle con comentarios).
