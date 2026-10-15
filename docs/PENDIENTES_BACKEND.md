# Pendientes del backend para el frontend

Creado el 12 de octubre de 2026; actualizado el 15 de octubre.

Revisé el front (rama `feat/nuevo-modelo`) contra el backend en tres fuentes: la rama `master` de
`Shtven/TutoriasBackend` (commit `2f199d5`), su documentación (`docs/API.md` y
`docs/AUTENTICACION.md`) y la API desplegada (`https://tutoriasbe.onrender.com/v3/api-docs`).

## Resumen

El backend resolvió el 15 de octubre los cinco puntos que se le pidieron y ya están desplegados.
Quedan dos pedidos nuevos y lo que estaba previsto para más adelante.

| #   | Pendiente                                                               | Estado                                 |
| --- | ----------------------------------------------------------------------- | -------------------------------------- |
| 1   | `POST /auth/signin` y `POST /auth/signup` con contraseña                | Resuelto y desplegado                  |
| 2   | Quién puede darse de alta como tutor                                    | Resuelto: lista de tutores autorizados |
| 3   | CORS para los orígenes del front                                        | Resuelto en producción                 |
| 4   | `materia` con una sola forma y respuestas tipadas en OpenAPI            | Resuelto                               |
| 5   | Pruebas de roles por endpoint                                           | Resuelto (`RolesPorEndpointTest`)      |
| 6   | Indicar en `GET /admin/tutores` quién sigue pre-registrado              | **Nuevo**, prioridad media             |
| 7   | Confirmar el correo antes de activar una cuenta                         | **Nuevo**, prioridad media (seguridad) |
| 8   | A futuro: sesión en cookie `HttpOnly` y paginación en listados de admin | Cuando se pueda                        |

---

## Lo que se resolvió

**1. Acceso con contraseña.** El contrato coincide con lo que el front ya enviaba: los mismos
bodies, `{ token, usuario }` en la respuesta y los errores por campo con las claves del body. El
JWT trae `sub`, `rol`, `tipo: "SESION"` y `exp`. Los ajustes del front fueron:

- **Login de admin:** los admin entran con su número de personal (p. ej. `25480`), que no tiene el
  formato `S` + 8 dígitos. El front ahora lo acepta y lo manda tal cual.
- **Errores del signin:** muestra `401 Usuario o contraseña incorrectos.` y
  `429 Demasiados intentos fallidos…` arriba del formulario, y los errores por campo (`matricula`,
  `correo`, `pwd`) debajo del campo que corresponde.
- **Límites del registro:** el front valida los del backend: nombre ≤ 50, apellidos ≤ 200,
  correo ≤ 255 y contraseña de 8 a 72 caracteres y ≤ 72 bytes.
- **Registro:** el signup devuelve el token y entra directo.

**2. Lista de tutores autorizados.** El signup como `TUTOR` solo procede si un admin
pre-registró la matrícula y el correo con `POST /admin/tutores`. Lo que agregó el front:

- **Pantalla Tutores** (`/administracion/tutores`): el admin ve la lista, autoriza tutores y
  quita pre-registros (`DELETE /admin/tutores/{matricula}`).
- **Registro:** avisa que el rol Tutor requiere autorización, pide usar el mismo correo y muestra
  bajo su campo los rechazos de `rol` y `correo`.

**3. CORS.** Comprobado con un preflight el 15 de octubre:

- El origen real del front, `https://sistemadetutoriasfront.onrender.com`, está permitido, con
  todos los métodos y las cabeceras `Authorization` y `Content-Type`.
- `http://localhost:4173` (`npm run preview`) no está permitido en producción (`403`). Solo hace
  falta si se quiere probar el build local contra el backend desplegado. El `.env.example` del
  backend ya lo incluye; bastaría agregarlo en Render.

**4. Contrato.** `materia` llega como objeto `{ idMateria, nombre, nrc }` en todas las respuestas,
y los controladores ya no devuelven `ResponseEntity<?>`. El front sigue aceptando `materia` como
texto, por compatibilidad. Siguen siendo válidas las reglas para cambiar el contrato (ver
[Lo que hay que mantener](#lo-que-hay-que-mantener)).

**5. Roles por endpoint.** `RolesPorEndpointTest` comprueba el `401` sin token y el `403` con un
rol no permitido.

---

## 6. Indicar quién sigue pre-registrado en `GET /admin/tutores`

`GET /admin/tutores` devuelve `UsuarioResumen` (`matricula`, `nombre`, `apellidos`,
`nombreCompleto`) e incluye a los pre-registrados, pero no dice quién ya creó su cuenta.

- **Hoy:** la pantalla Tutores ofrece "Quitar" en todos. El backend rechaza, con razón, a quien ya
  creó su cuenta (`Solo se puede quitar un tutor pre-registrado que aún no crea su cuenta.`), y el
  front muestra ese mensaje.
- **Pedido:** agregar un campo a cada elemento, por ejemplo `"cuentaCreada": false` (o el
  `proveedor`, que es `null` en un pre-registro). Así el front marca "Pendiente" a quien aún no
  entra y solo le ofrece "Quitar" a esa persona.
- Es un campo nuevo: no rompe al front actual.

---

## 7. Confirmar el correo antes de activar una cuenta

Lo documenta el propio backend en `AUTENTICACION.md` § 4 ("Riesgo conocido"): el signup no
comprueba que la persona controle el correo.

- **Riesgo:** quien conozca la matrícula y el correo de un tutor pre-registrado, o de una cuenta
  anterior de Microsoft o Google, puede reclamar la cuenta antes que su dueño.
- **Mientras tanto:** la pantalla Tutores le recomienda al admin autorizar a cada tutor poco antes
  de que cree su cuenta.
- **Solución:** enviar un código o un enlace por correo (SendGrid) y activar la cuenta al
  confirmarlo. Avísenme cuando lo diseñen para agregar la pantalla de confirmación.
- **Relacionado:** no hay recuperación de contraseña. Hoy solo un admin la restablece desde la BD.

---

## 8. A futuro (no urgente)

- **Sesión en cookie `HttpOnly; Secure; SameSite`** en lugar de devolver el JWT en el body.
  Ahora el front lo guarda en `localStorage`, y un XSS podría robarlo. Requiere protección CSRF y
  cambios en ambos lados.
- **Paginación en el servidor** para `GET /admin/tutorias` y `GET /materias`, que hoy devuelven
  todo.

---

## Lo que hay que mantener

- **Endpoints:** todos los que usa el front existen en la API desplegada, con los mismos métodos,
  parámetros de query y bodies.
- **401 y 403:** `401` con un token inválido o vencido y `403` cuando el rol no tiene permiso. Ante
  cualquier 401 el front cierra la sesión, salvo en `/auth/signin`, donde significa credenciales
  incorrectas. Ante un 403 solo muestra el error.
- **Errores:** el formato `{ success, message, data }` y los errores de validación por campo en
  `data`, con los nombres de campo del body.
- **Respuestas validadas:** el front valida las de tutorías, inscripciones, sesiones, pase de
  lista, `/usuarios/me` y `GET /admin/tutorias` (`src/api/esquemas.js`). Se puede agregar
  cualquier campo; si se renombra, se quita o cambia de tipo uno de los que valida
  (identificadores, listas, `cupo`, `horarios`, `materia`), la pantalla muestra un error.
  **Avisen antes de desplegar** un cambio así.
- **URLs:** si cambia `https://tutoriasbe.onrender.com`, avisar al front: está en la
  configuración de producción y en la CSP del sitio. Si cambia el origen del front, hay que
  actualizar `CORS_ALLOWED_ORIGINS`.
