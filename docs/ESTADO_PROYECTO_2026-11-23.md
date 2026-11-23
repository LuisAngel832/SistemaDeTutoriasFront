# Estado del proyecto: Sistema de Tutorías (frontend)

Fecha: 2026-11-23 · Rama: `main` (`72698fe`, del 2026-10-15) · Auditoría anterior:
[AUDITORIA_FRONTEND.md](AUDITORIA_FRONTEND.md) (2026-10-09, seguimiento 2026-10-15) ·
Revisión: código estático, comandos de solo lectura y peticiones HTTP al sitio desplegado.

## Resumen

**El código está en buen estado; el despliegue no.** Lint, formato, build y las 236 pruebas
pasan, y casi todos los hallazgos de la auditoría de octubre están resueltos en el código. Pero
al revisar el sitio publicado en Render aparecieron dos problemas que no se veían desde el
repositorio:

1. **Recargar cualquier página o abrir un enlace directo da "Not Found".** Render no aplica la
   regla SPA de `render.yaml`: `/login`, `/tutor/home` y `/tutorado/home` responden **404** en
   texto plano. Solo funciona entrar por `/` y navegar desde ahí.
2. **Las cabeceras de seguridad de `render.yaml` no llegan al navegador**: ni CSP, ni
   `X-Frame-Options`, ni `Referrer-Policy`, ni `Permissions-Policy`. Lo más probable es que el
   servicio de Render (`sistemadetutoriasfront`) se haya creado a mano y no esté ligado al
   Blueprint (que se llama `tutorias-frontend`), así que ignora todo `render.yaml`.

Además: **Sentry no tiene DSN en producción** (no se reporta ningún error), **el backend tarda
17 s en despertar y el front corta a los 15 s**, y **la CI va a fallar en el próximo push**
por una vulnerabilidad nueva en `zod`. No hay commits en `main` desde hace 39 días, y los bugs
visuales del reporte del 20 de octubre siguen sin corregir.

**Notas (1–10), comparadas con octubre:**

| Área                   | Oct | Nov | Motivo                                                               |
| ---------------------- | --- | --- | -------------------------------------------------------------------- |
| Arquitectura           | 8   | 8   | Sin cambios; sigue sólida                                            |
| Componentes            | 7   | 8   | Mutaciones y debounce unificados                                     |
| Seguridad (código)     | 5   | 8   | Solo token, rol del JWT, validación de respuestas, registro de tutor |
| Seguridad (desplegado) | —   | 5   | Las cabeceras de `render.yaml` no se aplican                         |
| Rendimiento            | 7   | 8   | `zod/mini`, fuente precargada, Sentry en chunk aparte                |
| Accesibilidad          | 6   | 8   | Contrastes corregidos, skip link, foco del menú móvil                |
| Calidad de código      | 8   | 9   | 236 pruebas, 94 % de cobertura                                       |
| Dependencias           | 6   | 7   | 2 vulnerabilidades nuevas en prod (fáciles), 7 PRs de Dependabot     |
| Build y despliegue     | 5   | 4   | Rewrite SPA y cabeceras ausentes, sin Sentry, CI a punto de fallar   |

**¿Listo para usuarios reales?** No hasta arreglar el rewrite SPA en Render: cualquier recarga
o enlace de un correo deja al usuario en "Not Found". El resto de lo urgente es configuración,
no código: unas 2–3 horas en total.

---

## Comandos ejecutados

| Comando                      | Resultado                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `node -v` / `npm -v`         | v22.21.0 / 11.17.0                                                                                             |
| `npx eslint .`               | **0 errores, 0 avisos**                                                                                        |
| `npx prettier --check .`     | Falla solo en `docs/propuestas-logo/` (sin versionar): `generar-logos.mjs`, `index.html`                       |
| `npx vite build`             | OK en 3,6 s, sin avisos, sin `.map`                                                                            |
| `npx vitest run --coverage`  | **23 archivos, 236 pruebas, todas pasan** (51 s). Stmts 94,0 % · Branches 77,1 % · Funcs 93,1 % · Lines 95,6 % |
| `npm audit --omit=dev`       | **2** (1 alta: `zod` < 4.6.6; 1 moderada: `fast-uri`, transitiva de `@hookform/resolvers`)                     |
| `npm audit`                  | 16 (2 críticas, 4 altas, 9 moderadas, 1 baja); las 14 restantes son de herramientas de dev                     |
| `npm outdated`               | 26 paquetes; majors pendientes: `@hookform/resolvers` 7, `jest-dom` 8, `jsdom` 29, `msw` 3                     |
| `gh pr list` / `gh run list` | 7 PRs abiertos; último push a `main` el 2026-10-15                                                             |
| `curl` al sitio desplegado   | `/` 200; `/login`, `/tutor/home`, `/tutorado/home` **404**; solo `nosniff` y HSTS                              |
| `curl` al backend            | `/v3/api-docs` 200 en **16,9 s** en frío y 1,6 s ya despierto                                                  |

El bundle publicado lleva el `release` `72698fe`, así que lo desplegado es el `main` actual.
No se modificó ningún archivo versionado (el build regeneró `dist/`, que está ignorado).

---

## Qué cambió desde la auditoría de octubre

| Hallazgo de octubre                        | Estado hoy                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| H-01/H-05 JWT sin CSP, sin cabeceras       | **Regresión en la práctica:** están en `render.yaml`, pero Render no las envía (ver N-01)            |
| H-02 Autorregistro como tutor              | Resuelto (pre-registro por el admin). Falta confirmar el correo (backend)                            |
| H-03/H-12 Rol desde `localStorage`         | Resuelto                                                                                             |
| H-04 Dependencias vulnerables              | Resuelto entonces; **hay dos nuevas** (N-03)                                                         |
| H-06/H-07 zod clásico, fuente              | Resuelto                                                                                             |
| H-08/H-09 Contraste                        | Resuelto                                                                                             |
| H-10 Respuestas sin validar                | Resuelto                                                                                             |
| H-11/H-13 Duplicados, estado de navegación | Resuelto                                                                                             |
| H-14 Despliegue sin esperar a la CI        | **No verificable:** `autoDeployTrigger: checksPass` está en `render.yaml`, que Render parece ignorar |
| H-15 Sin monitorización                    | **Abierto en la práctica:** el código está listo, pero el bundle publicado no tiene DSN              |
| H-16 Trabajo sin commit                    | Resuelto (solo queda `docs/propuestas-logo/`)                                                        |

Del [reporte de pruebas del 2026-10-20](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/28)
(PR abierto, sin fusionar): comprobé en el código que V1, V2 y V4 siguen igual
(`catalogo.module.css:149` con `1fr`, contenedores de tabla sin `position: relative`,
`svg { display: block }` global), y que S8 (vaciar la caché al cerrar sesión) sigue pendiente.
S4 (HSTS) ya lo pone Render por su cuenta (`max-age=315360000; preload`).

---

## Hallazgos nuevos

### N-01 · Crítica · Render no aplica `render.yaml`: enlaces directos en 404 y sin cabeceras

- **Evidencia:** `curl -I https://sistemadetutoriasfront.onrender.com/tutor/home` →
  `404 Not Found`, `text/plain`, cuerpo `Not Found`. Lo mismo con `/login` y `/tutorado/home`.
  En `/` solo llegan `x-content-type-options` y `strict-transport-security` (que Render pone
  por defecto); faltan las cinco cabeceras de `render.yaml`.
- **Causa probable:** el servicio se llama `sistemadetutoriasfront` y el Blueprint declara
  `tutorias-frontend`. Un Static Site creado a mano no lee `render.yaml`: sus rutas y cabeceras
  se configuran en el panel de Render. Si es así, tampoco aplica `autoDeployTrigger: checksPass`.
- **Impacto:** cualquier usuario que recargue la página, use atrás/adelante tras cerrar la
  pestaña, guarde un marcador o abra un enlace de un correo (recordatorios, cancelaciones) ve
  "Not Found". Además la app se puede embeber en un iframe (clickjacking sobre "Cerrar
  periodo" o "Cerrar lista").
- **Solución (elegir una):**
  1. En el panel del servicio: **Redirects/Rewrites** → `/*` → `/index.html`, acción
     _Rewrite_; **Headers** → las cinco de `render.yaml`; **Settings → Auto-Deploy** → _After CI
     checks pass_. Rápido y sin cambiar la URL.
  2. Ligar el servicio al Blueprint. Ojo: con el nombre actual de `render.yaml` Render crearía
     un servicio nuevo con otra URL, y el CORS del backend solo permite
     `sistemadetutoriasfront.onrender.com`. Habría que cambiar `name:` a `sistemadetutoriasfront`.
- **Verificar después:** `curl -I .../tutor/home` debe dar 200 con `content-security-policy-report-only`
  y `x-frame-options: DENY`.

### N-02 · Alta · El backend tarda más en despertar que el timeout del front

- **Evidencia:** primera petición a `/v3/api-docs`: **16,9 s**; la segunda, 1,6 s.
  `TIMEOUT_MS = 15_000` en `src/api/client.js:7`.
- **Impacto:** el primer login después de 15 minutos sin uso falla con "El servidor tardó
  demasiado en responder". Ya estaba como O1 en el reporte de octubre; ahora está medido.
- **Solución:** a corto plazo, reintentar una vez las peticiones de `/auth/*` con un aviso
  "Despertando el servidor…", o subir el timeout de auth a 60 s. Lo definitivo es una instancia
  del backend que no se duerma.

### N-03 · Alta · La CI fallará en el próximo push por `zod`

- **Evidencia:** `npm audit --omit=dev` marca `zod` 4.6.5 con
  [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) (alta, agotamiento
  de memoria al validar colecciones enormes). La CI corre `npm audit --omit=dev --audit-level=high`,
  así que cualquier push o PR nuevo saldrá en rojo, y si el despliegue espera a la CI, `main`
  queda congelado. `fast-uri` (moderada) llega por `ajv`, dependencia de `@hookform/resolvers`;
  no aparece en el bundle.
- **Impacto real:** bajo (el front valida formularios y respuestas de su propio backend), pero
  bloquea la CI.
- **Solución:** fusionar el [PR de Dependabot de versiones menores](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/32)
  (pasa la CI y sube `zod` a 4.6.7, `vite` a 8.3.6 y `react-router-dom` a 7.18.5) y después
  `npm audit fix` para `fast-uri`.

### N-04 · Alta · Sentry no está activo en producción

- **Evidencia:** el bundle publicado (`index-BKrc3Am3.js`) no contiene ningún DSN. El código
  solo inicializa Sentry si existe `VITE_SENTRY_DSN`.
- **Impacto:** los errores de los usuarios, los fallos de carga de chunks y las respuestas con
  forma inesperada del backend no le llegan a nadie. Todo el trabajo de H-15 y H-10 está
  inactivo.
- **Solución:** crear el proyecto en Sentry o GlitchTip, definir `VITE_SENTRY_DSN` en Render y
  volver a desplegar. Si es GlitchTip, cambiar `*.sentry.io` en `connect-src`.

### N-05 · Media · Bugs visuales del 20 de octubre sin corregir y el reporte sin fusionar

- **Dónde:** [PR del reporte de pruebas](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/28),
  abierto hace 34 días. 15 bugs visuales, 3 funcionales y 8 de seguridad; los dos de severidad
  alta son de una línea de CSS cada uno:
  - V1: `src/features/admin/pages/catalogo.module.css:149` → `minmax(0, 1fr)`.
  - V2: `position: relative` en `.tablaContenedor` (`TutoriasFacultad.module.css:26`) y en
    `.contenedor` (`MatrizAsistencia.module.css:1`).
- **Solución:** fusionar el reporte (es solo documentación) y abrir un PR con V1, V2, V4 y F1
  (confirmar antes de quitar un tema). El resto puede ir en un segundo PR.

### N-06 · Media · Rezago de Dependabot

| PR                                                                                                                                           | Cambio                       | CI  | Recomendación                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --- | --------------------------------------------------------------------------------- |
| [#32](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/32)                                                                        | 22 menores/parches           | ✅  | Fusionar primero (arregla N-03)                                                   |
| [#23](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/23), [#24](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/24) | `checkout` y `setup-node` v7 | ✅  | Fusionar                                                                          |
| [#21](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/21)                                                                        | `lint-staged` 17             | ✅  | Fusionar tras probar el hook de pre-commit                                        |
| [#20](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/20)                                                                        | `jsdom` 30                   | ✅  | Fusionar tras rebase sobre #32                                                    |
| [#22](https://github.com/LuisAngel832/SistemaDeTutoriasFront/pull/22)                                                                        | `msw` 3                      | ❌  | `npm ci` falla: el lockfile del PR no está sincronizado. Cerrarlo y migrar a mano |

Las ramas de los PRs tienen más de un mes; conviene pedir a Dependabot que las rehaga
(`@dependabot rebase`) antes de fusionar.

### N-07 · Media · La CSP sigue en Report-Only

Aunque Render la enviara, `Content-Security-Policy-Report-Only` no bloquea nada. El recorrido
del 20 de octubre no encontró violaciones. Después de N-01, recorrer los tres roles en
producción con la consola abierta y, si no hay avisos, renombrarla a
`Content-Security-Policy` en el panel de Render (o `render.yaml`) y en `vite.config.js`.

### N-08 · Baja · `docs/propuestas-logo/` sin versionar y fuera de formato

Si se hace commit así, `npm run format:check` falla en la CI. Pasar `prettier --write` sobre la
carpeta antes del commit, o agregarla a `.prettierignore` si es material de trabajo.

### N-09 · Baja · Pendientes menores que siguen abiertos

- La caché de React Query no se vacía al cerrar sesión (S8): `queryClient.clear()` en
  `cerrarSesion` (`src/features/auth/AuthProvider.jsx:83`).
- Un id no numérico en la URL llega al backend (F2) y un estado de panel desconocido no
  explica nada (F3).
- Del backend ([PENDIENTES_BACKEND.md](PENDIENTES_BACKEND.md)): indicar quién sigue
  pre-registrado (6), confirmar el correo al registrarse (7) y la cookie `HttpOnly` (8).

---

## Métricas

| Métrica                           | Oct 2026      | Nov 2026                                             |
| --------------------------------- | ------------- | ---------------------------------------------------- |
| Líneas de código (sin pruebas)    | —             | 8.564 JS/JSX + 5.295 CSS                             |
| Líneas de pruebas                 | —             | 3.762                                                |
| Archivos de prueba / pruebas      | 17 / 177      | 23 / 236                                             |
| Cobertura de sentencias / ramas   | 92,6 / 75,7 % | 94,0 / 77,1 %                                        |
| Archivo más grande                | 346 líneas    | 346 líneas (`TutoriasFacultad.jsx`)                  |
| `eslint-disable`                  | 1             | 1 (justificado, `Modal.jsx:36`)                      |
| TODO / `console.log` / HTML crudo | 0             | 0                                                    |
| JS inicial (gzip)                 | 116,5 kB      | 129,9 kB (`index`) + 14,4 kB `zod` en login/registro |
| Vulnerabilidades en producción    | 1 paquete     | 2 paquetes                                           |

Sentry va en su propio chunk (30,5 kB gzip) y no se descarga si no hay DSN.

---

## Plan recomendado

### Hoy (configuración, ~2–3 horas)

| Acción                                                                             | Hallazgo |
| ---------------------------------------------------------------------------------- | -------- |
| Render: rewrite `/*` → `/index.html`, las cinco cabeceras y auto-deploy tras la CI | N-01     |
| Fusionar el PR #32 y correr `npm audit fix`                                        | N-03     |
| Definir `VITE_SENTRY_DSN` en Render y redesplegar                                  | N-04     |
| Reintento o timeout largo en `/auth/*` mientras el backend duerma                  | N-02     |
| Comprobar con `curl -I` que `/tutor/home` da 200 con cabeceras                     | N-01     |

### Esta semana

| Acción                                                                              | Hallazgo   |
| ----------------------------------------------------------------------------------- | ---------- |
| Fusionar el reporte de pruebas y corregir V1, V2, V4 y F1                           | N-05       |
| Fusionar #23, #24, #21 y #20; cerrar #22 y planear `msw` 3                          | N-06       |
| Recorrer los tres roles en producción y pasar la CSP a modo estricto                | N-07       |
| Formatear o ignorar `docs/propuestas-logo/`; `queryClient.clear()` al cerrar sesión | N-08, N-09 |

### Después

Lo de la Fase 3 de la auditoría de octubre sigue vigente: e2e con Playwright contra el backend
real (habría detectado N-01), TypeScript empezando por `api/`, paginación en los listados de
admin, cookie `HttpOnly` y presupuesto de tamaño del bundle en la CI. Conviene añadir a la CI
una comprobación posterior al despliegue que pida una ruta interna y revise el código 200 y
las cabeceras.

---

## Seguimiento (2026-11-23, rama `fix/estado-noviembre`)

| Hallazgo         | Estado    | Detalle                                                                                                                                                                                                                                                                                                   |
| ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N-02             | Mitigado  | El login y el registro esperan hasta 60 s (`TIMEOUT_DESPERTAR_MS`); las demás peticiones siguen en 15 s. A los 5 s el botón dice "Despertando el servidor…" y aparece un aviso en una región `role="status"`. Lo definitivo sigue siendo un backend que no se duerma.                                     |
| N-03             | Resuelto  | `npm audit fix`: `zod` 4.6.7 y `fast-uri` 3.1.9. `npm audit --omit=dev`: 0 vulnerabilidades (en desarrollo quedan 5 moderadas, de 16).                                                                                                                                                                    |
| N-05             | Parcial   | V1, V2 y V4 corregidos y medidos en el navegador a 375 px con los datos de las pruebas: tarjetas de Experiencias de 443 a 343 px; ancho de página en Tutorías de la facultad de 863 a 375 px y en Historial de 441 a 375 px; íconos de asistencia en la línea del texto. Falta F1 y el resto del reporte. |
| N-01, N-04, N-07 | Pendiente | Configuración del panel de Render (rewrite SPA, cabeceras, auto-deploy, `VITE_SENTRY_DSN`).                                                                                                                                                                                                               |

Pruebas: 24 archivos, 240 pruebas en verde (nuevas: `useEsperaLarga` y el timeout del acceso); lint, formato y build sin avisos.
