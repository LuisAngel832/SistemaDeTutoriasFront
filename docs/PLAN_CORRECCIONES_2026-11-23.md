# Plan de correcciones: informe de pruebas del 23 de noviembre de 2026

Este plan cubre los puntos críticos y de prioridad alta del informe de pruebas de usabilidad. Para cada punto se revisó el código del frontend y se dice dónde está el fallo: en el frontend (FE), en el backend (BE) o en los dos.

Las causas del frontend están confirmadas en el código. Las del backend se deducen del comportamiento que describe el informe: este repositorio no las puede comprobar.

## Resumen

| #   | Punto del informe                                | Gravedad | Dónde se arregla                                 | Esfuerzo           |
| --- | ------------------------------------------------ | -------- | ------------------------------------------------ | ------------------ |
| 1   | B.2.1 Un tutor abre tutorías ajenas (IDOR)       | Crítica  | **BE** (lo que protege) + FE (que no lo ofrezca) | BE medio · FE bajo |
| 2   | A.2.1 Registro de tutor sin verificar el correo  | Crítica  | **BE** + FE (pantalla del código)                | BE alto · FE medio |
| 3   | B.2.2 "Editar tutoría" no carga edificio ni aula | Alta     | **FE**                                           | Bajo               |
| 4   | C.2.1 Fecha de inscripción frente al historial   | Alta     | **BE** (datos o consulta)                        | Investigar         |
| 5   | A.2.2 "Quitar" activo con todos los tutores      | Alta     | **BE** (nuevo campo) + FE                        | Bajo               |
| 6   | A.2.3 El NRC está en Materia                     | Alta     | **BE** (modelo de datos) + FE                    | Alto, aparte       |
| 7   | B.2.7 / C.2.5 Detalle roto a ~1000 px            | Media    | **FE**                                           | Bajo               |

## Fase 1: el frontend, ya mismo (un PR)

Estos cambios no dependen del backend, así que pueden salir hoy.

### 1.1 Editar tutoría: edificio y aula vacíos (B.2.2)

**Causa:** el formulario arranca antes de que lleguen los edificios.

- `EditarTutoria.jsx` monta `FormularioTutoria` con `defaultValues` `{ edificio: '1', aula: '9' }`.
- Los `<select>` no están controlados (`register`). Al montarse todavía no tienen la opción `1`, así que el navegador no la selecciona.
- Cuando llegan los edificios, la pantalla muestra "Elige el edificio" y "Elige el aula".
- Mientras tanto, react-hook-form sigue guardando `edificio = '1'`. Por eso el aula aparece habilitada con las 12 opciones (B.2.8 del informe).
- Al guardar, se mandaría un lugar distinto del que se ve en pantalla.

**Arreglo:**

- En `EditarTutoria.jsx`, mostrar el `Skeleton` mientras `catalogos.cargando` y montar el formulario solo con los catálogos ya cargados.

**Prueba:** un test con MSW en el que `/catalogos/edificios` responde más tarde que `/tutorias/:id`. Debe comprobar que el select muestra "Edificio 1" y "Aula 9".

### 1.2 No ofrecer acciones sobre una tutoría ajena (parte FE de B.2.1)

Esto **no** cierra el hueco, que está en el backend (punto 2.1). Sirve para que la interfaz deje de ofrecer "Desactivar", "Editar" y "Agregar tema" sobre tutorías de otros, y para que un error no parezca una lista vacía.

**Arreglo:**

- En `TutoriaDetalle.jsx` y `EditarTutoria.jsx`, comparar `tutoria.tutor?.matricula` con la matrícula de la sesión (el `sub` del JWT, a través de `useAuth`). Si no coinciden, mostrar `DetalleError` con "Esta tutoría no es tuya" y un enlace a "Mis tutorías".
- En `useDetalleTutor.js`, devolver también `errorInscritos`. `PanelInscritos.jsx` debe mostrar el error en un `Alert` en lugar de "Todavía no hay tutorados inscritos".
- Comprobar en `src/api/client.js` que un 403 llegue con un mensaje claro, porque el backend lo devolverá cuando se corrija la fase 2.

**Prueba:** el tutor S21009342 abre una tutoría cuyo `tutor.matricula` es otra. No debe ver ningún botón de acción. Otro test: `/inscritos` responde 400 y el panel muestra el error.

### 1.3 Detalle de tutoría a ~1000 px (B.2.7, C.2.5)

**Causa:** los cortes de `DetalleTutoria.module.css` se miden con el ancho de la **ventana**, no con el del contenido.

- La barra lateral ocupa unos 250 px.
- Con 1000 px de ventana, el contenido mide unos 750 px y sigue en dos columnas: la izquierda se queda en unos 380 px.
- `ListaSesiones.module.css` necesita `120px 130px 1fr auto`, así que no cabe y los textos se parten y pisan los botones.

**Arreglo:**

- Pasar los cortes a container queries (`container-type: inline-size` en el contenedor del detalle).
- El detalle pasa a una columna por debajo de 860 px de contenido.
- La fila de sesión pasa a dos líneas (fecha y estado arriba; recordatorio y botones debajo) por debajo de 640 px de lista. Los mosaicos de Horarios y Lugar pasan a una columna por debajo de 560 px de tarjeta.
- Revisar el `word-break` que parte "miércole/s" y "noviemb/re": usar `overflow-wrap: break-word` en lugar de `anywhere`.

**Prueba:** comprobarlo en la vista previa a 1000, 1280 y 375 px, con los paneles de tutor y de tutorado.

## Fase 2: el backend, con urgencia (repositorio TutoriasBackend)

### 2.1 Comprobar quién es el dueño en `/tutorias/{id}/**` (B.2.1). Hacerlo primero.

- Hoy `GET /tutorias/1` responde 200 a otro tutor. `sesiones` e `inscritos` dan 400; están protegidos, pero con el código equivocado.
- Falta confirmar si `PUT /tutorias/{id}`, `PATCH .../desactivar`, `POST /horarios/{id}/temas` y `DELETE /temas/{id}` comprueban quién es el dueño. **Es lo más urgente:** si no lo comprueban, cualquier tutor puede desactivar o editar las tutorías de otro.
- **Arreglo:**
  - Un solo punto de control en la capa de servicio, por ejemplo `exigirDuenio(tutoria, usuarioActual)`, que llamen todos los endpoints de escritura y lectura del tutor.
  - Para los temas, la comprobación sube del horario a su tutoría.
  - El `GET /tutorias/{id}` público (el que usa el tutorado para explorar) puede seguir abierto, pero sin campos solo del tutor.
- Si falta el permiso, devolver **403** (no 400). Un recurso que no existe debe dar 404.
- **Prueba:** tests de integración con dos tutores, en los que el tutor B intenta cada operación sobre una tutoría del tutor A y recibe 403.

### 2.2 Verificar el correo al registrarse (A.2.1)

- Después de `POST /auth/signup`, la cuenta queda `PENDIENTE` y se manda un código de 6 dígitos (o un enlace) al correo autorizado.
- `POST /auth/verificar` activa la cuenta; `signin` rechaza las cuentas pendientes.
- Que el código caduque, con un límite de reintentos y la opción de reenviarlo.
- Al menos para el rol TUTOR. Lo ideal es pedirlo para todos los roles.
- **Lo que toca al FE (fase 3):**
  - Una pantalla "Revisa tu correo" con el campo del código y la opción de reenviarlo.
  - Quitar el aviso "el registro todavía no confirma…" de `TutoresAutorizados.jsx`.

### 2.3 Fecha de inscripción frente al historial (C.2.1)

El frontend solo muestra lo que llega: `fechaInscripcion`, `nueva`, `primera` y `historial` vienen del backend. Hay que investigar en el backend:

1. ¿La inscripción de "luis angel" en Matemáticas discretas tiene `fechaInscripcion = 2026-10-19` en la base de datos? Si viene de los datos de prueba, corregirla y no tocar el código.
2. ¿Qué filtro usa `GET /inscripciones/tutorias/{id}` para armar el historial? ¿Sesiones posteriores a la fecha de inscripción, o con un registro de asistencia del tutorado?
3. ¿Qué cuenta la baja automática? Debe usar **el mismo criterio** que el historial que ve el tutorado.

### 2.4 Indicar quién ya creó su cuenta (A.2.2)

- `GET /admin/tutores` debe incluir `cuentaCreada: boolean`.
- **Lo que toca al FE:** en `TutoresAutorizados.jsx`:
  - Desactivar "Quitar" cuando `cuentaCreada`, con el motivo en un `title` o en el texto.
  - Mostrar una insignia "Cuenta creada" / "Pendiente".
  - Quitar el comentario que dice que el backend no lo informa.

### 2.5 Códigos HTTP en toda la API (B.2.1, C.2.4)

Revisar el `@ControllerAdvice`: `AccessDeniedException` y las excepciones de permiso propias deben dar 403, y las de no encontrado 404. Cambiarlo junto con 2.1.

## Fase 3: el frontend, cuando el backend esté listo

- Pantalla de verificación del correo (2.2).
- "Quitar" según `cuentaCreada` (2.4).
- Mensajes de 403/404 coherentes en las pantallas que hoy reciben 400.

## Aparte: decidir dónde va el NRC (A.2.3)

No es un fallo de código, sino una decisión de modelo que cambia el SRS, la base de datos, la API y varias pantallas. Primero hay que confirmar con quien lleve el SRS si en este sistema el NRC identifica la sección.

- **Si identifica la sección:** moverlo a `Tutoria`, o crear una entidad `Seccion`, con migración de datos.
- **Lo que toca al FE:**
  - El catálogo de EE ya no pediría el NRC.
  - Lo pediría el formulario de crear tutoría.
  - Habría que cambiar `EncabezadoDetalle`, las tarjetas y la búsqueda.

No conviene mezclarlo con las fases anteriores.

## Orden recomendado

1. **Hoy, en el BE:** confirmar con dos cuentas si la escritura sobre tutorías ajenas está abierta (2.1). Si lo está, corregirlo antes que nada.
2. **Hoy, en el FE:** un PR con la fase 1 (1.1, 1.2, 1.3).
3. **Esta semana, en el BE:** 2.1 + 2.5 juntos, 2.3 (investigar) y 2.4.
4. **Siguiente iteración:** 2.2 (verificación del correo) y su pantalla del FE.
5. **Aparte:** la decisión del NRC.

Los demás puntos del informe (rendimiento de `/admin/tutorias`, filtros de Explorar, textos que no cambian con el filtro, regla de minutos, confirmaciones inconsistentes) quedan para después de estas fases.

## Seguimiento

| Punto                               | Estado                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1.1 Editar tutoría: edificio y aula | Hecho: el formulario espera a los catálogos. El nuevo test falla sin el arreglo.                                            |
| 1.2 Tutoría ajena e inscritos       | Hecho: usa `esDueno` (documentado en `API.md` del backend) y la matrícula del tutor. **Sigue pendiente 2.1 en el backend.** |
| 1.3 Detalle a ~1000 px              | Hecho con container queries. Revisado en la vista previa a 375, 1000 y 1280 px, en el panel del tutor y del tutorado.       |
| Fases 2 y 3                         | Pendientes (backend).                                                                                                       |
