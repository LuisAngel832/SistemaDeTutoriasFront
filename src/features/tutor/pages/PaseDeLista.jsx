import { useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EncabezadoPagina, Pagina } from '@/components/layout/Pagina'
import { Alert, Avatar, Badge, Button, Card, Modal, Skeleton } from '@/components/ui'
import { IconAlerta, IconCheck } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { ESTADO_SESION } from '@/constants/tutoria'
import { MarcaAsistencia, MarcaFija } from '@/features/tutor/components/MarcaAsistencia'
import { usePaseDeLista } from '@/features/tutor/hooks/usePaseDeLista'
import { BadgeEstado } from '@/features/tutorias/components/BadgeEstado'
import { avisar } from '@/utils/avisos'
import { clases } from '@/utils/clases'
import { formatFechaLarga, formatLugar, formatRangoHora, pluralizar } from '@/utils/formatters'
import styles from './PaseDeLista.module.css'

// Pantallas 12 y 13: pase de lista de una sesion y su cierre. Una lista ya cerrada se muestra
// en solo lectura ("Ver lista").
const PaseDeLista = () => {
  const { idSesion } = useParams()
  const navigate = useNavigate()
  const { lista, isLoading, error, guardando, cerrando, marcar, cerrar } = usePaseDeLista(idSesion)
  const [confirmando, setConfirmando] = useState(false)

  if (isLoading) {
    return (
      <Pagina aria-busy="true">
        <Skeleton height={60} />
        <Skeleton height={420} />
      </Pagina>
    )
  }

  if (error || !lista) {
    return (
      <Pagina>
        <Alert tone="error">
          {error || 'No encontramos este pase de lista.'}{' '}
          <Link to={ROUTES.tutor.inicio}>Volver a mis tutorías</Link>
        </Alert>
      </Pagina>
    )
  }

  const { sesion, tutorados = [], resumen = {}, cierre = {} } = lista
  const abierta = sesion.estado === ESTADO_SESION.LISTA_ABIERTA

  const cambiarMarca = async (matricula, asistio) => {
    const res = await marcar([{ matricula, asistio }])
    if (!res.ok) avisar(res)
  }

  const marcarTodos = async () => {
    const res = await marcar(tutorados.map((t) => ({ matricula: t.matricula, asistio: true })))
    if (!res.ok) avisar(res)
  }

  const confirmarCierre = async () => {
    const res = await cerrar()
    setConfirmando(false)
    if (!res.ok) {
      avisar(res)
      return
    }
    navigate(ROUTES.tutor.historial(sesion.idTutoria), {
      state: {
        cierre: { fecha: sesion.fecha, bajas: res.resultado?.bajasAplicadas ?? [] },
      },
    })
  }

  return (
    <Pagina>
      <div>
        <Button as={Link} to={ROUTES.tutor.detalle(sesion.idTutoria)} variant="secondary" size="sm">
          ← {sesion.materia?.nombre}
        </Button>
      </div>
      <EncabezadoPagina
        title="Pase de lista"
        subtitle={`${sesion.materia?.nombre} · ${formatFechaLarga(sesion.fecha, { anio: true, mayuscula: false })} · ${formatRangoHora(sesion.horaInicio, sesion.horaFin)} · ${formatLugar(sesion.edificio, sesion.aula)}`}
        action={<BadgeEstado tipo="sesion" estado={sesion.estado} />}
      />

      <div className={styles.grid}>
        <Card as="section" padding="lg" aria-label="Tutorados inscritos">
          <div className={styles.encabezado}>
            <h2 className={styles.titulo}>
              Tutorados inscritos <span className={styles.cantidad}>{tutorados.length}</span>
            </h2>
            <div className={styles.progreso}>
              <span>
                <strong>
                  {resumen.marcados ?? 0} de {resumen.inscritos ?? tutorados.length}
                </strong>{' '}
                marcados
              </span>
              <span className={styles.pista} aria-hidden="true">
                <span
                  style={{
                    width: `${
                      resumen.inscritos ? ((resumen.marcados ?? 0) / resumen.inscritos) * 100 : 0
                    }%`,
                  }}
                />
              </span>
            </div>
            {abierta ? (
              <Button variant="secondary" size="sm" disabled={guardando} onClick={marcarTodos}>
                Marcar a todos: asistió
              </Button>
            ) : null}
          </div>

          {tutorados.length ? (
            <ul className={styles.lista}>
              {tutorados.map((tutorado) => (
                <FilaTutorado
                  key={tutorado.matricula}
                  tutorado={tutorado}
                  abierta={abierta}
                  guardando={guardando}
                  onCambiar={(asistio) => cambiarMarca(tutorado.matricula, asistio)}
                />
              ))}
            </ul>
          ) : (
            <p className={styles.vacio}>Esta sesión no tiene tutorados inscritos.</p>
          )}
        </Card>

        <aside className={styles.lateral}>
          <Resumen resumen={resumen} />
          {abierta ? (
            <PanelCierre cierre={cierre} onCerrar={() => setConfirmando(true)} />
          ) : (
            <Card as="section" padding="lg">
              <h2 className={styles.lateralTitulo}>Lista cerrada</h2>
              <p className={styles.texto}>
                La sesión quedó como completada y la lista ya no se puede modificar.
              </p>
              <Link to={ROUTES.tutor.historial(sesion.idTutoria)} className={styles.enlace}>
                Ver historial de asistencia →
              </Link>
            </Card>
          )}
        </aside>
      </div>

      {abierta ? (
        <ModalCierre
          open={confirmando}
          sesion={sesion}
          resumen={resumen}
          bajas={cierre.bajasPrevistas ?? []}
          loading={cerrando}
          onConfirmar={confirmarCierre}
          onCerrar={() => setConfirmando(false)}
        />
      ) : null}
    </Pagina>
  )
}

const FilaTutorado = ({ tutorado, abierta, guardando, onCambiar }) => {
  const previas = tutorado.inasistenciasPrevias ?? 0
  return (
    <li className={clases(styles.fila, tutorado.causaraBaja && styles.filaBaja)}>
      <div className={styles.persona}>
        <Avatar nombre={tutorado.nombreCompleto} una />
        <div className={styles.datos}>
          <strong>{tutorado.nombreCompleto}</strong>
          <span className={clases(previas >= 2 && styles.previasAviso)}>
            {tutorado.matricula} ·{' '}
            {pluralizar(previas, 'inasistencia previa', 'inasistencias previas')}
          </span>
        </div>
        {abierta ? (
          <MarcaAsistencia
            nombre={tutorado.nombreCompleto}
            matricula={tutorado.matricula}
            valor={tutorado.asistio}
            disabled={guardando}
            onCambiar={onCambiar}
          />
        ) : (
          <MarcaFija valor={tutorado.asistio} />
        )}
      </div>
      {abierta && tutorado.causaraBaja ? (
        <p className={styles.avisoBaja}>
          <IconAlerta />
          <span>
            Con esta inasistencia suma <strong>{previas + 1}</strong>. Al cerrar la lista se le dará
            de baja automáticamente y le avisaremos por correo.
          </span>
        </p>
      ) : null}
    </li>
  )
}

const Resumen = ({ resumen }) => (
  <Card as="section" padding="lg" aria-label="Resumen">
    <h2 className={styles.lateralTitulo}>Resumen</h2>
    <dl className={styles.resumen}>
      <div>
        <dt>
          <span className={clases(styles.punto, styles.puntoAsistio)} />
          Asistieron
        </dt>
        <dd>{resumen.asistieron ?? 0}</dd>
      </div>
      <div>
        <dt>
          <span className={clases(styles.punto, styles.puntoFalto)} />
          No asistieron
        </dt>
        <dd>{resumen.noAsistieron ?? 0}</dd>
      </div>
      <div>
        <dt>
          <span className={styles.punto} />
          Sin marca
        </dt>
        <dd>{resumen.sinMarca ?? 0}</dd>
      </div>
    </dl>
  </Card>
)

const CONDICIONES = [
  ['todosMarcados', 'Todos los tutorados tienen marca'],
  ['sesionIniciada', 'La sesión ya inició'],
  ['noCancelada', 'La sesión no está cancelada'],
]

const PanelCierre = ({ cierre, onCerrar }) => {
  const idTitulo = useId()
  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <h2 className={styles.lateralTitulo} id={idTitulo}>
        Cerrar pase de lista
      </h2>
      <p className={styles.texto}>
        Al cerrarla, la sesión queda como completada, la lista ya no se puede editar y se calculan
        las bajas automáticas.
      </p>
      <ul className={styles.condiciones}>
        {CONDICIONES.map(([clave, texto]) => (
          <li key={clave} className={clases(cierre[clave] && styles.cumplida)}>
            <span className={styles.check} aria-hidden="true">
              {cierre[clave] ? <IconCheck /> : null}
            </span>
            {texto}
            <span className={styles.oculto}>{cierre[clave] ? ': listo' : ': pendiente'}</span>
          </li>
        ))}
      </ul>
      <Button fullWidth disabled={!cierre.puedeCerrar} onClick={onCerrar}>
        Cerrar pase de lista
      </Button>
    </Card>
  )
}

const ModalCierre = ({ open, sesion, resumen, bajas, loading, onConfirmar, onCerrar }) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onCerrar}
    title="¿Cerrar el pase de lista?"
    description={`${sesion.materia?.nombre} · ${formatFechaLarga(sesion.fecha, { mayuscula: false })} · ${formatRangoHora(sesion.horaInicio, sesion.horaFin)}`}
    actions={
      <>
        <Button variant="secondary" onClick={onCerrar} disabled={loading}>
          Volver
        </Button>
        <Button onClick={onConfirmar} loading={loading}>
          {loading ? 'Cerrando…' : 'Sí, cerrar lista'}
        </Button>
      </>
    }
  >
    <div className={styles.conteos}>
      <p className={styles.conteoAsistio}>
        <strong>{resumen.asistieron ?? 0}</strong>
        {resumen.asistieron === 1 ? 'Asistió' : 'Asistieron'}
      </p>
      <p className={styles.conteoFalto}>
        <strong>{resumen.noAsistieron ?? 0}</strong>
        {resumen.noAsistieron === 1 ? 'No asistió' : 'No asistieron'}
      </p>
    </div>
    {bajas.length ? (
      <div className={styles.bajas}>
        <p className={styles.bajasTitulo}>
          <IconAlerta />
          {bajas.length === 1
            ? 'Se aplicará 1 baja automática'
            : `Se aplicarán ${bajas.length} bajas automáticas`}
        </p>
        <ul>
          {bajas.map((baja) => (
            <li key={baja.matricula}>
              <Avatar nombre={baja.nombreCompleto} una size="sm" />
              <span>
                <strong>{baja.nombreCompleto}</strong>
                {baja.matricula} · {pluralizar(baja.inasistencias, 'inasistencia')}
              </span>
              <Badge tone="danger">Baja</Badge>
            </li>
          ))}
        </ul>
        <p className={styles.bajasTexto}>
          {bajas.length === 1 ? 'Su inscripción pasará' : 'Sus inscripciones pasarán'} a baja
          automática y enviaremos un correo a {bajas.length === 1 ? 'la persona' : 'cada tutorado'}{' '}
          y a ti. {bajas.length === 1 ? 'Su lugar quedará libre.' : 'Sus lugares quedarán libres.'}
        </p>
      </div>
    ) : null}
    <p className={styles.texto}>Después de cerrarla ya no podrás modificar esta lista.</p>
  </Modal>
)

export default PaseDeLista
