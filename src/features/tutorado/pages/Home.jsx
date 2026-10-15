import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EncabezadoPagina, GridTarjetas, Pagina } from '@/components/layout/Pagina'
import { Alert, Button, Card, EmptyState, Input, Skeleton } from '@/components/ui'
import { IconBuscar } from '@/components/ui/icons'
import { DIAS_HABILES } from '@/constants/horarios'
import { ROUTES } from '@/constants/routes'
import { TarjetaExplorar } from '@/features/tutorado/components/TarjetaExplorar'
import { useExplorarTutorias } from '@/features/tutorado/hooks/useExplorarTutorias'
import { useValorDiferido } from '@/features/tutorias/hooks/useValorDiferido'
import { clases } from '@/utils/clases'
import { pluralizar } from '@/utils/formatters'
import styles from './Home.module.css'

const ESPERA_BUSQUEDA_MS = 300

// Pantalla 03. Los filtros viven en la URL (?q=&dia=&lugar=1&choques=1) para conservarlos al
// volver del detalle.
const ExplorarTutorias = () => {
  const [parametros, setParametros] = useSearchParams()
  const q = parametros.get('q') ?? ''
  const dia = parametros.get('dia') ?? ''
  const soloConLugar = parametros.get('lugar') === '1'
  const ocultarChoques = parametros.get('choques') === '1'

  const filtros = useMemo(
    () => ({ q, dia, soloConLugar, ocultarChoques }),
    [q, dia, soloConLugar, ocultarChoques],
  )
  const { tutorias, isLoading, actualizando, error } = useExplorarTutorias(filtros)

  const cambiar = useCallback(
    (clave, valor) =>
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales)
          if (valor) nuevos.set(clave, valor)
          else nuevos.delete(clave)
          return nuevos
        },
        { replace: true },
      ),
    [setParametros],
  )

  // El campo sigue a la URL cuando esta cambia sin escribir (menu, historial): se ajusta durante
  // el render, como recomienda React para el estado derivado de otro valor.
  const [busqueda, setBusqueda] = useState(q)
  const [qAnterior, setQAnterior] = useState(q)
  if (q !== qAnterior) {
    setQAnterior(q)
    if (q !== busqueda.trim()) setBusqueda(q)
  }

  // La busqueda se envia cuando se deja de escribir. Solo cuando el valor diferido ya alcanzo lo
  // escrito: si la URL acaba de cambiar, el valor diferido anterior no debe pisarla.
  const busquedaDiferida = useValorDiferido(busqueda.trim(), ESPERA_BUSQUEDA_MS)
  useEffect(() => {
    if (busquedaDiferida === busqueda.trim() && busquedaDiferida !== q) {
      cambiar('q', busquedaDiferida)
    }
  }, [busquedaDiferida, busqueda, q, cambiar])

  const hayFiltros = Boolean(q || dia || soloConLugar || ocultarChoques)

  const buscador = (
    <div className={styles.buscador}>
      <span className={styles.icono} aria-hidden="true">
        <IconBuscar />
      </span>
      <Input
        type="search"
        className={styles.campo}
        aria-label="Buscar por Experiencia Educativa o tutor"
        placeholder="Buscar Experiencia Educativa o tutor…"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
      />
    </div>
  )

  return (
    <Pagina aria-busy={isLoading || actualizando}>
      <EncabezadoPagina
        title="Explorar tutorías"
        subtitle="Encuentra una tutoría con lugar disponible e inscríbete a todos sus horarios."
        action={buscador}
      />

      <Card className={styles.filtros}>
        <div className={styles.dias} role="group" aria-label="Filtrar por día">
          <span className={styles.etiqueta} aria-hidden="true">
            Día
          </span>
          <button
            type="button"
            className={clases(styles.dia, !dia && styles.diaActivo)}
            aria-pressed={!dia}
            onClick={() => cambiar('dia', '')}
          >
            Todos
          </button>
          {DIAS_HABILES.map((opcion) => (
            <button
              key={opcion.key}
              type="button"
              className={clases(styles.dia, dia === opcion.key && styles.diaActivo)}
              aria-pressed={dia === opcion.key}
              aria-label={opcion.nombre}
              onClick={() => cambiar('dia', dia === opcion.key ? '' : opcion.key)}
            >
              {opcion.abreviado}
            </button>
          ))}
        </div>

        <div className={styles.casillas}>
          <label className={styles.casilla}>
            <input
              type="checkbox"
              checked={soloConLugar}
              onChange={(evento) => cambiar('lugar', evento.target.checked ? '1' : '')}
            />
            Solo con lugares disponibles
          </label>
          <label className={styles.casilla}>
            <input
              type="checkbox"
              checked={ocultarChoques}
              onChange={(evento) => cambiar('choques', evento.target.checked ? '1' : '')}
            />
            Ocultar las que se cruzan con mis horarios
          </label>
        </div>
      </Card>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {isLoading ? (
        <GridTarjetas>
          <Skeleton height={300} />
          <Skeleton height={300} />
          <Skeleton height={300} />
        </GridTarjetas>
      ) : tutorias.length === 0 && !error ? (
        hayFiltros ? (
          <EmptyState
            title="Sin resultados"
            description="No hay tutorías que coincidan con los filtros. Prueba con otros."
          />
        ) : (
          <EmptyState
            title="No hay tutorías disponibles"
            description="Vuelve más tarde o revisa tus inscripciones actuales."
            action={
              <Button as={Link} to={ROUTES.tutorado.inscripciones} variant="brand">
                Ver mis tutorías
              </Button>
            }
          />
        )
      ) : (
        <>
          <p className={styles.conteo} role="status">
            {pluralizar(tutorias.length, 'tutoría disponible', 'tutorías disponibles')}
          </p>
          <GridTarjetas className={styles.rejilla}>
            {tutorias.map((tutoria) => (
              <TarjetaExplorar
                key={tutoria.idTutoria}
                tutoria={tutoria}
                desde={parametros.toString()}
              />
            ))}
          </GridTarjetas>
        </>
      )}
    </Pagina>
  )
}

export default ExplorarTutorias
