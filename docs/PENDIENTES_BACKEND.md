# Pendientes del backend para el frontend

Fecha: 12 de octubre de 2026 (actualizado el 14 de octubre).

Revisé el front (rama `feat/nuevo-modelo`) contra el backend en dos fuentes: la rama `master` de
`Shtven/TutoriasBackend` (commit `d745981`) y la API desplegada
(`https://tutoriasbe.onrender.com/v3/api-docs`).

## Resumen

| #   | Pendiente                                                                         | Prioridad                                   |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Crear `POST /auth/signin` y `POST /auth/signup` (correo o matrícula y contraseña) | **Bloqueante**: sin esto no se puede entrar |
| 2   | Definir quién puede darse de alta como tutor                                      | Alta (seguridad)                            |
| 3   | Permitir en CORS los orígenes del front                                           | Media                                       |
| 4   | Unificar la forma de `materia` y tipar las respuestas en OpenAPI                  | Baja                                        |
| 5   | Pruebas de integración de roles por endpoint                                      | Baja                                        |
| 6   | A futuro: sesión en cookie `HttpOnly` y paginación en listados de admin           | Cuando se pueda                             |

Lo demás ya coincide; ver [Lo que ya está bien](#lo-que-ya-está-bien).

---

## 1. Acceso con correo o matrícula y contraseña (bloqueante)

El front ya no usa Microsoft ni Google. Ahora inicia sesión y registra con contraseña, pero el
backend solo expone `/auth/microsoft`, `/auth/google` y `/auth/registro`. Hasta que existan estos
dos endpoints no se puede iniciar sesión ni crear cuentas desde el front.

Ambos endpoints son públicos (ya están dentro de `/auth/**` en `SecurityConfig`) y responden con
el sobre de siempre: `{ success, message, data }`.

### `POST /auth/signin`

**Body**: un identificador y la contraseña.

```json
{ "matricula": "S23014587", "pwd": "secreta123" }
```

```json
{ "correo": "zs23014587@estudiantes.uv.mx", "pwd": "secreta123" }
```

- El front decide cuál mandar: si lo que escribió el usuario tiene `@`, manda `correo`; si no,
  manda `matricula`.
- Ya llega normalizado. La matrícula viene sin la `z` inicial, con `S` mayúscula y 8 dígitos
  (`S23014587`); el correo, en minúsculas.

**Respuesta 200**: la misma forma que hoy devuelve el login con proveedor (`LoginResponsive.sesion`).

```json
{
  "success": true,
  "message": "Login",
  "data": {
    "token": "<JWT>",
    "usuario": {
      "matricula": "S23014587",
      "nombre": "Ana",
      "apellidos": "López Pérez",
      "correo": "zs23014587@estudiantes.uv.mx",
      "rol": "TUTORADO"
    }
  }
}
```

**JWT**: igual que `JWTUtils.generarToken`, con `sub` = matrícula, `rol` = `TUTORADO` | `TUTOR` |
`ADMIN`, `tipo` = `sesion` y `exp`.

- El front toma el rol y la matrícula **del token**, no del objeto `usuario`.
- Cierra la sesión justo en `exp`. No hay refresh token.

**Errores**

- Credenciales incorrectas: `400` o `401` con `message`, por ejemplo
  `"Usuario o contraseña incorrectos."`. El front muestra el `message` tal cual. En este
  endpoint, un 401 no cierra ninguna sesión.
- Usar **el mismo mensaje** si el usuario no existe y si la contraseña está mal, para no revelar
  qué matrículas o correos están registrados.
- Recomendado: limitar intentos por IP y por cuenta (fuerza bruta).

### `POST /auth/signup`

**Body**

```json
{
  "nombre": "Sofía",
  "apellidos": "Ramos Gutiérrez",
  "matricula": "S24011236",
  "correo": "zs24011236@estudiantes.uv.mx",
  "pwd": "secreta12",
  "rol": "TUTORADO"
}
```

`rol` es `TUTORADO` o `TUTOR` (ver el punto 2). El front nunca manda `ADMIN`.

**Validaciones**: el front ya valida lo siguiente; el backend debe validarlo también.

| Campo       | Regla en el front           | Además en el backend (límites de la BD) |
| ----------- | --------------------------- | --------------------------------------- |
| `nombre`    | No vacío                    | Máximo 50 caracteres                    |
| `apellidos` | No vacío                    | Máximo 200 caracteres                   |
| `matricula` | `^S\d{8}$`                  | Única                                   |
| `correo`    | Email válido, en minúsculas | Único, máximo 255 caracteres            |
| `pwd`       | Mínimo 8 caracteres         |                                         |
| `rol`       | `TUTORADO` o `TUTOR`        | La regla del punto 2                    |

**Respuesta 200**: cualquiera de las dos formas funciona.

- `data: { token, usuario }`, como en el signin: el front entra directo.
- `data: null`: el front manda al login con el aviso "Cuenta creada".

**Errores por campo**: el front pinta cada mensaje bajo su campo si llegan así.

```json
{
  "success": false,
  "message": "Error de validación",
  "data": { "matricula": "La matrícula ya está registrada." }
}
```

- Las claves deben ser **los nombres del body**: `nombre`, `apellidos`, `matricula`, `correo`,
  `pwd` y `rol`. El `GlobalExceptionHandler` ya arma este formato para los `@Valid`.
- Las matrículas o correos duplicados conviene devolverlos también así, por campo. Hoy salen como
  `BusinessException` con un mensaje general, y el front tendría que mostrarlo arriba del
  formulario en lugar de bajo el campo.

### Contraseñas y base de datos

- Guardar la contraseña con **BCrypt** (`PasswordEncoder` de Spring Security). Nunca en texto
  plano, ni en los logs, ni en ninguna respuesta.
- La tabla `usuario` no tiene columna de contraseña: hace falta una migración, por ejemplo
  `pwd_hash VARCHAR(100)`.
- Revisar estas restricciones:
  - `ck_usuario_proveedor` solo admite `MICROSOFT` o `GOOGLE`.
  - `ck_usuario_proveedor_id` interpreta `proveedor IS NULL` como **pre-registro**.

  Hay que decidir cómo se marcan las cuentas con contraseña (por ejemplo `proveedor = 'LOCAL'`) para
  que la lógica de pre-registro de `AuthService.login(IdentidadVerificada)` no las confunda.

- Decidir si `/auth/microsoft`, `/auth/google` y `/auth/registro` se quedan. El front ya no los
  usa.

---

## 2. Quién puede darse de alta como tutor (seguridad)

Hoy `AuthService.registrar` acepta `TUTOR` sin aprobación
(`ROLES_REGISTRABLES = {TUTORADO, TUTOR}`). Además, `auth.google.dominio=gmail.com` deja entrar a
cualquier cuenta de Gmail.

- **Riesgo:** cualquiera puede crearse una cuenta de tutor y publicar tutorías, pasar lista y
  aplicar bajas automáticas a tutorados reales.
- **Lo que el front no puede hacer:** el front mantiene el selector de rol en el registro, pero
  ocultarlo no resolvería nada, porque cualquiera puede llamar a la API directamente. La regla
  tiene que estar en el backend, también en el nuevo `/auth/signup`.

Opciones, de menos a más trabajo:

1. **Lista de tutores autorizados.** El admin pre-registra las matrículas de los tutores (ya
   existe el concepto de pre-registro en `usuario`). El signup como `TUTOR` solo procede si la
   matrícula está en esa lista.
2. **Tutor pendiente de aprobación.** La cuenta se crea, pero no puede iniciar sesión (o no puede
   publicar) hasta que un admin la aprueba.
3. **Solo tutorados por signup.** Los tutores los crea el admin, o un admin cambia el rol con un
   endpoint como `PATCH /admin/usuarios/{matricula}/rol`.

Avísenme cuál eligen para ajustar el front: un mensaje de "cuenta pendiente", quitar el selector
o una pantalla de admin.

---

## 3. CORS

En producción no hay proxy: el navegador llama al backend desde otro origen. `CORS_ALLOWED_ORIGINS`
debe incluir estos orígenes:

- **Producción:** el origen del Static Site del front en Render (por ejemplo
  `https://tutorias-frontend.onrender.com`; confirmar la URL real).
- **Staging o PR previews:** el origen que tenga, cuando lo creemos.
- **Pruebas del build en local:** `http://localhost:4173` (`npm run preview`). El servidor de
  desarrollo (5173) usa el proxy de Vite y no necesita CORS.

Debe permitir los métodos `GET`, `POST`, `PUT`, `PATCH`, `DELETE` y `OPTIONS`, y las cabeceras
`Authorization` y `Content-Type`.

---

## 4. Consistencia del contrato

**`materia` llega con dos formas.** Es un objeto `{ idMateria, nombre, nrc }` en
`TutoriaResumenResponsive`, pero texto (`String`) en `HistorialTutoriaResponsive`,
`ProximaSesionResponsive`, `SesionResponsive`, `ChoqueConResponsive` y `SemanaItemResponsive`.

- El front acepta las dos formas en cualquier endpoint y la convierte siempre a objeto, así que
  pueden unificarla sin coordinar el despliegue.
- Si la unifican, que sea al objeto `{ idMateria, nombre, nrc }`. `nombre` es obligatorio;
  `idMateria` y `nrc` pueden faltar.

**El front valida las respuestas críticas.** Las de tutorías, inscripciones, sesiones, pase de
lista, `/usuarios/me` y `GET /admin/tutorias` se comprueban contra los DTO de `master`
(`src/api/esquemas.js`).

- Se validan los campos de los que depende la interfaz: identificadores, listas, `cupo`,
  `horarios` y `materia`.
- Pueden agregar campos nuevos sin avisar. Una lista que llegue como `null` se trata como vacía.
- Si renombran, quitan o cambian el tipo de uno de esos campos, la pantalla muestra un error y
  lo reporta. La página no se cae, pero deja de funcionar: **avisen antes de desplegar**.

**Respuestas sin tipo en OpenAPI.** Los controladores devuelven `ResponseEntity<?>`, así que
`/v3/api-docs` no describe las respuestas. Tiparlas (`ResponseEntity<ApiResponse<X>>` o
`@ApiResponse` de springdoc) permitiría generar los tipos del front y detectar cambios que lo
rompan.

---

## 5. Pruebas de roles por endpoint

Hoy cada endpoint valida el rol con `@PreAuthorize`. Para que no se pierda en un refactor,
convendría tener pruebas de integración que comprueben, por endpoint, dos cosas:

- **Sin token:** responde `401`.
- **Con un rol no permitido:** responde `403`. Sobre todo en `/admin/**` y en los de tutor
  (sesiones, pase de lista, crear o editar tutorías).

---

## 6. A futuro (no urgente)

- **Sesión en cookie `HttpOnly; Secure; SameSite`** en lugar de devolver el JWT en el body.
  Ahora el front lo guarda en `localStorage`, y un XSS podría robarlo. Requiere protección CSRF y
  cambios en ambos lados.
- **Paginación en el servidor** para `GET /admin/tutorias` y `GET /materias`, que hoy devuelven
  todo.

---

## Lo que ya está bien

No hace falta tocar nada de esto:

- **Endpoints:** todos los demás que usa el front existen en la API desplegada, con los mismos
  métodos, parámetros de query y bodies:
  - tutorías, inscripciones, sesiones y pase de lista;
  - temas, comentarios, materias, catálogos;
  - admin y `/usuarios/me`.
- **Roles:** el rol se lee del JWT firmado (`JWTFilter`), cada endpoint lo valida con
  `@PreAuthorize`, y `/admin/**` exige `ADMIN`.
- **401 y 403:** el backend responde `401` con un token inválido o vencido, y `403` cuando el rol
  no tiene permiso. **Mantenerlo así**: ante cualquier 401 el front cierra la sesión, y ante un
  403 solo muestra el error.
- **Errores:** el formato `{ success, message, data }` y los errores de validación por campo en
  `data`.
- **URL del backend:** si cambia `https://tutoriasbe.onrender.com`, avisar al front. Está en la
  configuración de producción y en la política de seguridad (CSP) del sitio.
