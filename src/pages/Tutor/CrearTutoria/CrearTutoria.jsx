import { Link } from 'react-router-dom'
import { PanelFormulario, Pagina } from '../../../components/layout/Pagina'
import { Alert, Button, FormField, Input, Modal, Select } from '../../../components/ui'
import { IconCrear } from '../../../components/ui/icons'
import { AULAS, EDIFICIOS } from '../../../constants/espacios'
import { ROUTES } from '../../../constants/routes'
import { TemasInput } from '../../../features/tutorias/components/TemasInput'
import useCrearTutoria from '../../../hooks/useCrearTutoria'
import { hoyLocalISO } from '../../../utils/fechas'
import { formatHorario } from '../../../utils/formatters'
import styles from './CrearTutoria.module.css'

const CrearTutoria = () => {
  const {
    valores,
    cambiar,
    temas,
    agregarTema,
    quitarTema,
    reset,
    crear,
    resultado,
    cerrarResultado,
    horarios,
    materias,
    cargandoListas,
    isSubmitting,
  } = useCrearTutoria()

  const alCambiar = (campo) => (evento) => cambiar(campo, evento.target.value)
  const sinMaterias = !cargandoListas && materias.length === 0
  const sinHorarios = !cargandoListas && horarios.length === 0

  const enviar = (evento) => {
    evento.preventDefault()
    crear()
  }

  return (
    <Pagina width="form">
      <PanelFormulario
        title="Crear Tutoria"
        subtitle="Programa una nueva sesion para tus tutorados."
        icon={<IconCrear />}
      >
        <form className={styles.formulario} onSubmit={enviar} noValidate>
          {resultado?.ok === false ? (
            <Alert tone="error" className={styles.completo}>
              {resultado.message}
            </Alert>
          ) : null}

          <FormField label="Experiencia Educativa que impartiras" htmlFor="nrc">
            <Select id="nrc" value={valores.nrc} onChange={alCambiar('nrc')} disabled={sinMaterias}>
              <option value="">
                {sinMaterias
                  ? 'No hay experiencias educativas registradas'
                  : 'Selecciona la Experiencia Educativa'}
              </option>
              {materias.map((materia) => (
                <option key={materia.nrc} value={materia.nrc}>
                  {materia.materia} (NRC {materia.nrc})
                </option>
              ))}
            </Select>
            {sinMaterias ? (
              <Alert tone="warning" compact>
                No hay experiencias educativas disponibles. Pide a un administrador que las
                registre.
              </Alert>
            ) : null}
          </FormField>

          <FormField label="Horario en el que daras la tutoria" htmlFor="horario">
            <Select
              id="horario"
              value={valores.idHorario}
              onChange={alCambiar('idHorario')}
              disabled={sinHorarios}
            >
              <option value="">
                {sinHorarios ? 'No tienes horarios disponibles' : 'Selecciona tu horario'}
              </option>
              {horarios.map((horario) => (
                <option key={horario.idHorario} value={horario.idHorario}>
                  {formatHorario(horario)}
                </option>
              ))}
            </Select>
            {sinHorarios ? (
              <Alert tone="warning" compact>
                <span>
                  Primero <Link to={ROUTES.tutor.horarios}>crea un horario</Link> para poder crear
                  una tutoria.
                </span>
              </Alert>
            ) : null}
          </FormField>

          <FormField label="Fecha en que se dara la tutoria" htmlFor="fecha">
            <Input
              id="fecha"
              type="date"
              min={hoyLocalISO()}
              value={valores.fecha}
              onChange={alCambiar('fecha')}
            />
          </FormField>

          <FormField label="Edificio donde se dara la tutoria" htmlFor="edificio">
            <Select id="edificio" value={valores.edificio} onChange={alCambiar('edificio')}>
              <option value="">Selecciona el edificio</option>
              {EDIFICIOS.map((numero) => (
                <option key={numero} value={numero}>
                  Edificio {numero}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Aula donde se dara la tutoria"
            htmlFor="aula"
            className={styles.completo}
          >
            <Select id="aula" value={valores.aula} onChange={alCambiar('aula')}>
              <option value="">Selecciona el aula</option>
              {AULAS.map((numero) => (
                <option key={numero} value={numero}>
                  Aula {numero}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Temas a tratar durante la tutoria (opcional)"
            htmlFor="tema-nuevo"
            className={styles.completo}
          >
            <TemasInput
              inputId="tema-nuevo"
              temas={temas}
              onAdd={agregarTema}
              onRemove={quitarTema}
            />
          </FormField>

          <div className={styles.acciones}>
            <Button variant="secondary" onClick={reset} disabled={isSubmitting}>
              Limpiar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear Tutoria'}
            </Button>
          </div>
        </form>
      </PanelFormulario>

      <Modal
        open={resultado?.ok === true}
        onClose={cerrarResultado}
        title="Tutoria creada"
        description={resultado?.message}
        actions={
          <>
            <Button as={Link} to={ROUTES.tutor.inicio} variant="secondary">
              Ver mis tutorias
            </Button>
            <Button onClick={cerrarResultado}>Crear otra</Button>
          </>
        }
      />
    </Pagina>
  )
}

export default CrearTutoria
