import { clases } from '@/utils/clases'
import styles from './Pagina.module.css'

// Estructura comun de las paginas privadas.

// width: wide (listados y detalles) | form (formularios centrados)
export const Pagina = ({ width = 'wide', className, children, ...props }) => (
  <main className={clases(styles.pagina, styles[width], className)} {...props}>
    {children}
  </main>
)

export const EncabezadoPagina = ({ title, subtitle, icon, action }) => (
  <div className={styles.encabezado}>
    <div className={styles.titulos}>
      <h1 className={styles.titulo}>
        {icon ? (
          <span className={styles.icono} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {title}
      </h1>
      {subtitle ? <p className={styles.subtitulo}>{subtitle}</p> : null}
    </div>
    {action ? <div className={styles.accion}>{action}</div> : null}
  </div>
)

export const GridTarjetas = ({ className, children, ...props }) => (
  <div className={clases(styles.grid, className)} {...props}>
    {children}
  </div>
)

// Tarjeta principal de los formularios (crear tutoria, horarios).
export const PanelFormulario = ({ title, subtitle, icon, children }) => (
  <section className={styles.panel}>
    <div className={styles.panelEncabezado}>
      <EncabezadoPagina title={title} subtitle={subtitle} icon={icon} />
    </div>
    {children}
  </section>
)
