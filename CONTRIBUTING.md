# Guia de contribucion

Gracias por contribuir al frontend del Sistema de Tutorias. Esta guia resume como
trabajamos para que el codigo se mantenga consistente.

## Preparar el entorno

```bash
nvm use            # Node 22 (ver .nvmrc)
npm install        # instala dependencias y los hooks de git (husky)
cp .env.example .env
npm run dev
```

Opcional, para que `git blame` ignore el commit de formato masivo:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## Ramas

- Parten de `develop` y usan un prefijo segun su proposito:
  `feat/`, `fix/`, `refactor/`, `style/`, `test/`, `docs/`, `chore/`, `build/`, `ci/`.
- Un PR = un objetivo. No mezcles cambios de formato, movimientos de archivos y
  cambios de logica en el mismo PR.
- Tamano objetivo: menos de 400 lineas de diff (salvo cambios puramente mecanicos,
  que se indican en la descripcion).

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/). commitlint rechaza
los mensajes que no cumplan el formato.

```
<tipo>(<alcance opcional>): <resumen en minusculas>

<cuerpo opcional: que cambia y por que>
```

Tipos habituales: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `build`, `ci`, `chore`.

## Convenciones de codigo

- **Idioma:** nombres de dominio en espanol (`tutoria`, `horario`, `inscripcion`) y
  terminos tecnicos en ingles (`isLoading`, `onSubmit`, `refetch`).
- **Textos visibles al usuario:** con acentos y ortografia correcta.
- **Exports:** named exports para hooks, utils y componentes compartidos; `default` solo
  en paginas.
- **Extensiones:** `.js` para archivos sin JSX y `.jsx` para componentes.
- **Reutiliza antes de crear:** formato de fechas/horas en `src/utils/formatters.js`,
  calculos de tiempo en `src/utils/fechas.js`, reglas de tutoria en `src/utils/tutoria.js`
  y valores fijos en `src/constants/`.
- **Formato:** lo resuelve Prettier (`npm run format`); no discutas estilo en las revisiones.

## Checklist antes de abrir un PR

- [ ] `npm run lint` sin errores ni warnings nuevos
- [ ] `npm run format:check` en verde
- [ ] `npm run build` exitoso
- [ ] Pruebas manuales en las pantallas afectadas, en escritorio y movil
      (ver "Checklist de pruebas manuales" en [PLAN_IMPLEMENTACION.md](PLAN_IMPLEMENTACION.md))
- [ ] Capturas antes/despues si hay cambios visuales
- [ ] README actualizado si cambian estructura, scripts o variables de entorno
