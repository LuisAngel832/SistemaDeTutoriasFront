import { useId } from 'react'
import { clases } from '@/utils/clases'
import styles from './Pagina.module.css'

// Estructura comun de las paginas privadas.

// Destino del enlace "Saltar al contenido" de AppLayout.
export const ID_CONTENIDO = 'contenido'

// width: wide (listados y detalles) | form (formularios centrados)
export const Pagina = ({ width = 'wide', className, children, ...props }) => (
  <main
    id={ID_CONTENIDO}
    tabIndex={-1}
    className={clases(styles.pagina, styles[width], className)}
    {...props}
  >
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

// Seccion de una pagina con titulo y, opcionalmente, un contador ("Sesiones de hoy 2").
export const SeccionPagina = ({ titulo, cantidad, accion, children }) => {
  const idTitulo = useId()
  return (
    <section className={styles.seccion} aria-labelledby={idTitulo}>
      <div className={styles.seccionEncabezado}>
        <h2 className={styles.seccionTitulo} id={idTitulo}>
          {titulo}
          {cantidad != null ? <span className={styles.cantidad}>{cantidad}</span> : null}
        </h2>
        {accion}
      </div>
      {children}
    </section>
  )
}
