# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el
proyecto sigue [Versionado Semantico](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- Prettier, Husky (lint-staged y commitlint), workflow de CI en GitHub Actions y Dependabot.
- Modulos compartidos `utils/` (formatters, fechas, reglas de tutoria) y `constants/`.
- Tipografia Montserrat cargada con Fontsource y metadatos para buscadores y redes sociales.
- `CONTRIBUTING.md`, `CHANGELOG.md` y plantilla de pull request.

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
