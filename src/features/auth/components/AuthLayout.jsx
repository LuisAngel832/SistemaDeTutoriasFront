import { clases } from '@/utils/clases'
import styles from './AuthLayout.module.css'

// Estructura de las pantallas de acceso: panel de marca + panel del formulario.
// En el panel de marca, `features` lista beneficios con palomita y `pasos` muestra el avance
// del registro: [{ texto, estado: 'hecho' | 'actual' | 'pendiente' }].
export const AuthLayout = ({
  eyebrow,
  brandTitle,
  brandSubtitle,
  features = [],
  pasos = [],
  title,
  subtitle,
  footer,
  children,
}) => (
  <div className={styles.pagina}>
    <div className={styles.contenedor}>
      <aside className={styles.marca}>
        <div className={styles.marcaSuperior}>
          <span className={styles.punto} aria-hidden="true" />
          <span className={styles.nombre}>Sistema de Tutorías</span>
        </div>

        <div className={styles.marcaCuerpo}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <p className={styles.marcaTitulo}>{brandTitle}</p>
          <p className={styles.marcaSubtitulo}>{brandSubtitle}</p>
          {features.length ? (
            <ul className={styles.caracteristicas}>
              {features.map((texto) => (
                <li key={texto}>
                  <span className={styles.check} aria-hidden="true">
                    ✓
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          ) : null}
          {pasos.length ? (
            <ol className={styles.pasos}>
              {pasos.map((paso, indice) => (
                <li
                  key={paso.texto}
                  className={clases(styles.paso, styles[paso.estado])}
                  aria-current={paso.estado === 'actual' ? 'step' : undefined}
                >
                  <span className={styles.numero} aria-hidden="true">
                    {paso.estado === 'hecho' ? '✓' : indice + 1}
                  </span>
                  {paso.texto}
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        <p className={styles.pie}>
          © {new Date().getFullYear()} Sistema de Tutorías · Facultad de Negocios y Tecnologías, UV
        </p>
      </aside>

      <main className={styles.panel}>
        <header className={styles.encabezado}>
          <h1 className={styles.titulo}>{title}</h1>
          {subtitle ? <p className={styles.subtitulo}>{subtitle}</p> : null}
        </header>

        {children}

        {footer ? (
          <>
            <div className={styles.divisor} aria-hidden="true">
              o
            </div>
            <p className={styles.cambio}>{footer}</p>
          </>
        ) : null}
      </main>
    </div>
  </div>
)
