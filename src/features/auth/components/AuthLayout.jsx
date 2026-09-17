import { clases } from '../../../utils/clases'
import styles from './AuthLayout.module.css'

// Estructura de login y registro: panel de marca + panel del formulario.
export const AuthLayout = ({
  brandTitle,
  brandSubtitle,
  features = [],
  title,
  subtitle,
  wide = false,
  footer,
  children,
}) => (
  <div className={styles.pagina}>
    <div className={clases(styles.contenedor, wide && styles.amplio)}>
      <aside className={styles.marca}>
        <div className={styles.marcaSuperior}>
          <span className={styles.punto} aria-hidden="true" />
          <span className={styles.nombre}>Sistema de Tutorias</span>
        </div>

        <div className={styles.marcaCuerpo}>
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
        </div>

        <p className={styles.pie}>© {new Date().getFullYear()} Sistema de Tutorias</p>
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
