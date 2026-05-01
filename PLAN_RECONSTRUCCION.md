# Plan de reconstruccion - Sistema de Tutorias

Este archivo sera la fuente unica para planear y dar seguimiento al trabajo.
Cada tarea se marca con:

- `[ ]` Pendiente
- `[~]` En progreso
- `[x]` Completada

## 1) Pantalla de registro e inicio de sesion

- [x] Definir campos y validaciones (registro y login)
- [x] Definir roles desde el inicio (tutor / tutorado)
- [x] Crear vistas UI de registro e inicio de sesion
- [x] Implementar validaciones de cliente (mensajes claros)
- [x] Integrar autenticacion con backend (registro/login)
- [x] Manejar estado de sesion (token, expiracion, logout)
- [x] Agregar manejo de errores (credenciales invalidas, usuario existente)
- [x] Proteger rutas segun sesion y rol

### Plan de implementacion - Mision 1 (Auth: Login + Registro)

Objetivo: reconstruir login y registro con apariencia y UX fieles al proyecto inicial, pero con estructura mas limpia y mantenible.

#### Fase 1 - Base visual y de estructura (fidelidad UI)

- [x] Reutilizar estructura visual de `LogIn` y `Registro` del repo inicial (logo, card centrada, links inferiores, boton verde).
- [x] Mantener clases CSS clave para conservar apariencia (`.Login`, `.login-content`, `.registro`, `.registro-content`, etc.).
- [x] Separar estilos por pagina como en el proyecto base (archivo principal + responsive).
- [x] Normalizar pequenos detalles de estilo sin alterar la identidad visual (espaciado, tamanos min/max, estados focus).

#### Fase 2 - Rutas y navegacion

- [x] Definir rutas publicas iniciales: `/login` y `/registro`.
- [x] Definir ruta por defecto para redirigir a `/login` si no hay sesion.
- [x] Conservar navegacion entre pantallas con `Link`/`navigate` como en la base.

#### Fase 3 - Modelo de datos de formularios

- [x] Login: `matricula`, `contrasena`.
- [x] Registro: `nombre`, `apellidoP`, `apellidoM`, `matricula`, `correo`, `password`, `rol`.
- [x] Mapear roles de UI a backend manteniendo los valores existentes del proyecto base (`alumno` y `profesor`) y documentar equivalencia con tutor/tutorado.

#### Fase 4 - Validacion de cliente (sin inventar reglas fuera del repo)

- [x] Validar campos obligatorios en login.
- [x] Validar campos obligatorios en registro.
- [x] Mantener mensajes simples y consistentes con el comportamiento original.
- [x] Evitar validaciones nuevas no presentes en el repo base (solo required + formato basico de correo por tipo `email`).

#### Fase 5 - Integracion con autenticacion existente

- [x] Reusar hook principal de autenticacion (`useAutentificacion`) como punto unico.
- [x] Permitir refactor interno del hook solo para mejorar legibilidad y separar helpers.
- [x] Mantener contrato funcional actual: `login(...)` y `registro(...)`.
- [x] Evitar crear features nuevas fuera del alcance (social login, MFA, etc.).

#### Fase 6 - Manejo de errores y estados

- [x] Mostrar error visible en login cuando falle autenticacion.
- [x] Mostrar error visible en registro cuando backend rechace alta.
- [x] Deshabilitar doble envio de formulario durante peticion (si ya existe estado de carga en hook, reutilizarlo).
- [x] Limpiar error al editar campos para mejor UX.

#### Fase 7 - Criterios de aceptacion de la mision

- [x] Login visualmente fiel al proyecto inicial y funcional con backend.
- [x] Registro visualmente fiel al proyecto inicial y funcional con backend.
- [x] Flujo de navegacion entre login y registro completo.
- [x] Lint y build en verde sin romper rutas existentes.

#### Restricciones tecnicas de esta mision

- [ ] No agregar funciones de negocio que no existan en el repo base.
- [ ] Si hace falta modularidad, solo crear helpers de apoyo a las funciones principales existentes.
- [ ] Priorizar refactor incremental sobre reescritura total.

## 2) Pantalla principal de tutor (mis tutorias)

- [ ] Definir estructura de dashboard de tutor
- [ ] Listar tutorias creadas por el tutor
- [ ] Filtros basicos (estado, fecha, modalidad)
- [ ] Acciones por tutoria (editar, cancelar, ver inscritos)
- [ ] Estado vacio cuando no hay tutorias
- [ ] Integrar datos reales desde backend

## 3) Formularios: crear horario y tutoria

- [ ] Definir modelo de datos para horario
- [ ] Definir modelo de datos para tutoria
- [ ] Construir formulario de crear horario
- [ ] Construir formulario de crear tutoria
- [ ] Validaciones de negocio (cupos, fechas, solapamientos)
- [ ] Feedback visual de guardado/carga/error
- [ ] Enviar datos al backend y refrescar listado

## 4) Pantalla principal de tutorado (explorar)

- [ ] Definir layout de exploracion de tutorias
- [ ] Mostrar catalogo de tutorias disponibles
- [ ] Busqueda por palabra clave
- [ ] Filtros (tema, fecha, tutor, modalidad)
- [ ] Vista de detalle de tutoria
- [ ] Integrar disponibilidad/cupos en tiempo real (o pseudo-real)

## 5) Flujo de inscripcion y cancelacion

- [ ] Definir reglas de negocio para inscripcion
- [ ] Implementar CTA de inscripcion desde explorar/detalle
- [ ] Confirmacion de inscripcion exitosa
- [ ] Manejo de errores de inscripcion (sin cupo, conflicto horario, etc.)
- [ ] Implementar cancelacion por tutorado
- [ ] Reflejar cambios en ambas vistas (tutor y tutorado)
- [ ] Registrar historial minimo de cambios (auditoria funcional)

## 6) Integracion completa frontend - backend

- [ ] Definir contrato de API (endpoints, request/response, errores)
- [ ] Crear capa de servicios HTTP en frontend
- [ ] Centralizar manejo de autenticacion y autorizacion
- [ ] Centralizar manejo de errores globales
- [ ] Implementar estados de carga consistentes
- [ ] Probar flujos E2E principales manualmente
- [ ] Documentar variables de entorno necesarias

## 7) Ajustes de usabilidad y diseno responsive

- [ ] Definir lineamientos visuales (tipografia, colores, espaciados)
- [ ] Mejorar jerarquia visual y legibilidad
- [ ] Mejorar accesibilidad base (labels, focus, contraste, teclado)
- [ ] Adaptar vistas clave a movil (registro, explorar, mis tutorias, formularios)
- [ ] Ajustar componentes para tablet y desktop
- [ ] Revisar textos UX (mensajes claros y consistentes)
- [ ] Pulido final de interacciones y estados vacios

---

## Hitos de avance

- [ ] Hito A: Auth lista (registro/login + rutas protegidas)
- [ ] Hito B: Tutor publica tutorias con horario
- [ ] Hito C: Tutorado explora y se inscribe
- [ ] Hito D: Cancelaciones y sincronizacion de vistas
- [ ] Hito E: Integracion completa y pulido responsive

## Regla de trabajo

Cuando terminemos una tarea:

1. Se cambia su estado a `[x]`.
2. Si estamos trabajando una tarea activa, se marca `[~]`.
3. Si surge trabajo nuevo, se agrega debajo de su seccion correspondiente.
