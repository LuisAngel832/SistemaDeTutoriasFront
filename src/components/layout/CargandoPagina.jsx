// Se muestra mientras se descarga el codigo de la primera pagina.
export const CargandoPagina = () => (
  <div className="cargando-pagina" role="status" aria-live="polite">
    <span className="cargando-pagina-spinner" aria-hidden="true" />
    <span className="cargando-pagina-texto">Cargando...</span>
  </div>
)
