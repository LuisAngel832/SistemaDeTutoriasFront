import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EncabezadoPagina, GridTarjetas, Pagina, SeccionPagina } from '@/components/layout/Pagina'
import { Alert, Button, EmptyState, Skeleton } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { CUPO_MAXIMO } from '@/constants/tutoria'
import { ConfirmarCancelacion } from '@/features/tutor/components/ConfirmarCancelacion'
import { TarjetaSesionHoy } from '@/features/tutor/components/TarjetaSesionHoy'
import { TarjetaTutoriaTutor } from '@/features/tutor/components/TarjetaTutoriaTutor'
import { useAccionesSesion } from '@/features/tutor/hooks/useAccionesSesion'
import { useInicioTutor } from '@/features/tutor/hooks/useInicioTutor'
import { avisar } from '@/utils/avisos'
import { formatFechaCorta, formatFechaLarga, formatRangoHora } from '@/utils/formatters'
import styles from './Home.module.css'

// Pantalla 09: sesiones de hoy (con sus acciones) y tutorias activas del tutor.
const TutorHome = () => {
  const navigate = useNavigate()
  const { fecha, sesiones, listasSinCerrar, tutorias, cargandoSesiones, cargandoTutorias, error } =
    useInicioTutor()
  const { abrirLista, cancelar, abriendo, cancelando } = useAccionesSesion()
  const [porCancelar, setPorCancelar] = useState(null)

  const abrir = async (sesion) => {
    const res = await abrirLista(sesion)
    if (res.ok && res.idSesion != null) navigate(ROUTES.tutor.paseDeLista(res.idSesion))
    else avisar(res)
  }

  const confirmarCancelacion = async () => {
    avisar(await cancelar(porCancelar))
    setPorCancelar(null)
  }

  return (
    <Pagina aria-busy={cargandoSesiones || cargandoTutorias}>
      <EncabezadoPagina
        title="Mis tutorías"
        subtitle={`${fecha ? `${formatFechaLarga(fecha)} · ` : ''}tus sesiones de hoy y tus tutorías activas.`}
        action={
          <Button as={Link} to={ROUTES.tutor.nuevaTutoria}>
            + Crear tutoría
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {listasSinCerrar.length ? (
        <Alert
          tone="warning"
          title={
            listasSinCerrar.length === 1
              ? 'Tienes 1 pase de lista sin cerrar'
              : `Tienes ${listasSinCerrar.length} pases de lista sin cerrar`
          }
        >
          <p className={styles.sinCerrarTexto}>
            No se cierran solos: mientras sigan abiertos, esas sesiones no cuentan como completadas.
          </p>
          <ul className={styles.sinCerrar}>
            {listasSinCerrar.map((sesion) => (
              <li key={sesion.idSesion}>
                <span>
                  {sesion.materia?.nombre} · {formatFechaCorta(sesion.fecha)} ·{' '}
                  {formatRangoHora(sesion.horaInicio, sesion.horaFin)}
                </span>
                <Link to={ROUTES.tutor.paseDeLista(sesion.idSesion)}>Ir al pase de lista</Link>
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <SeccionPagina titulo="Sesiones de hoy" cantidad={cargandoSesiones ? null : sesiones.length}>
        {cargandoSesiones ? (
          <GridTarjetas>
            <Skeleton height={200} />
            <Skeleton height={200} />
          </GridTarjetas>
        ) : sesiones.length ? (
          <GridTarjetas>
            {sesiones.map((sesion) => (
              <TarjetaSesionHoy
                key={sesion.idSesion ?? `${sesion.idHorario}-${sesion.fecha}`}
                sesion={sesion}
                ocupado={abriendo || cancelando}
                onAbrirLista={abrir}
                onCancelar={setPorCancelar}
              />
            ))}
          </GridTarjetas>
        ) : (
          <EmptyState compact description="No tienes sesiones hoy." />
        )}
      </SeccionPagina>

      <SeccionPagina titulo="Tus tutorías" cantidad={cargandoTutorias ? null : tutorias.length}>
        {cargandoTutorias ? (
          <GridTarjetas>
            <Skeleton height={280} />
            <Skeleton height={280} />
            <Skeleton height={280} />
          </GridTarjetas>
        ) : tutorias.length ? (
          <GridTarjetas>
            {tutorias.map((tutoria) => (
              <TarjetaTutoriaTutor key={tutoria.idTutoria} tutoria={tutoria} />
            ))}
          </GridTarjetas>
        ) : (
          <EmptyState
            title="Aún no tienes tutorías"
            description={`Crea una tutoría con sus horarios semanales; cada una admite ${CUPO_MAXIMO} tutorados.`}
            action={
              <Button as={Link} to={ROUTES.tutor.nuevaTutoria}>
                Crear tutoría
              </Button>
            }
          />
        )}
      </SeccionPagina>

      <ConfirmarCancelacion
        sesion={porCancelar}
        loading={cancelando}
        onConfirmar={confirmarCancelacion}
        onCerrar={() => setPorCancelar(null)}
      />
    </Pagina>
  )
}

export default TutorHome
