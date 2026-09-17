import { useState } from 'react'
import { PanelFormulario, Pagina } from '../../../components/layout/Pagina'
import { Alert, Button, FormField, Input, RadioGroup } from '../../../components/ui'
import { IconHorario } from '../../../components/ui/icons'
import { DIAS_SEMANA } from '../../../constants/horarios'
import useHorarios from '../../../hooks/useHorarios'
import { ListaHorarios } from './ListaHorarios'
import styles from './AgregarHorario.module.css'

const OPCIONES_DIA = DIAS_SEMANA.map((dia) => ({
  value: dia.label,
  label: dia.label,
  shortLabel: dia.short,
}))

const VALORES_INICIALES = { dia: '', horaInicio: '', horaFin: '' }

// "HH:mm" del input -> "HH:mm:ss" que espera el backend.
const conSegundos = (hora) => `${hora}:00`

const AgregarHorario = () => {
  const { horarios, isLoading, error, crearHorario, eliminarHorario } = useHorarios()

  const [valores, setValores] = useState(VALORES_INICIALES)
  const [resultado, setResultado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }))
    setResultado(null)
  }

  const limpiar = () => {
    setValores(VALORES_INICIALES)
    setResultado(null)
  }

  const enviar = async (evento) => {
    evento.preventDefault()

    if (!valores.dia || !valores.horaInicio || !valores.horaFin) {
      setResultado({ tone: 'error', texto: 'Completa todos los campos.' })
      return
    }
    if (valores.horaFin <= valores.horaInicio) {
      setResultado({ tone: 'error', texto: 'La hora final debe ser mayor que la hora de inicio.' })
      return
    }

    setEnviando(true)
    try {
      await crearHorario({
        dia: valores.dia,
        horaInicio: conSegundos(valores.horaInicio),
        horaFin: conSegundos(valores.horaFin),
      })
      setValores(VALORES_INICIALES)
      setResultado({ tone: 'success', texto: 'Horario creado correctamente.' })
    } catch (err) {
      setResultado({ tone: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  const eliminar = async (idHorario) => {
    setResultado(null)
    setEliminandoId(idHorario)
    try {
      await eliminarHorario(idHorario)
      setResultado({ tone: 'success', texto: 'Horario eliminado.' })
    } catch (err) {
      setResultado({ tone: 'error', texto: err.message })
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <Pagina width="form">
      <PanelFormulario
        title="Crear Horario"
        subtitle="Define los bloques recurrentes en los que puedes dar tutorias."
        icon={<IconHorario />}
      >
        <form className={styles.formulario} onSubmit={enviar} noValidate>
          {resultado ? <Alert tone={resultado.tone}>{resultado.texto}</Alert> : null}

          <RadioGroup
            variant="chip"
            name="dia"
            legend="Dia de la semana en que estaras disponible"
            options={OPCIONES_DIA}
            value={valores.dia}
            onChange={(dia) => cambiar('dia', dia)}
          />

          <div className={styles.horas}>
            <FormField label="Hora en que inicia tu disponibilidad" htmlFor="hora-inicio">
              <Input
                id="hora-inicio"
                type="time"
                value={valores.horaInicio}
                onChange={(evento) => cambiar('horaInicio', evento.target.value)}
              />
            </FormField>
            <FormField label="Hora en que termina tu disponibilidad" htmlFor="hora-fin">
              <Input
                id="hora-fin"
                type="time"
                value={valores.horaFin}
                onChange={(evento) => cambiar('horaFin', evento.target.value)}
              />
            </FormField>
          </div>

          <div className={styles.acciones}>
            <Button variant="secondary" onClick={limpiar} disabled={enviando}>
              Limpiar
            </Button>
            <Button type="submit" loading={enviando}>
              {enviando ? 'Guardando...' : 'Crear Horario'}
            </Button>
          </div>
        </form>

        <ListaHorarios
          horarios={horarios}
          isLoading={isLoading}
          error={error}
          eliminandoId={eliminandoId}
          onEliminar={eliminar}
        />
      </PanelFormulario>
    </Pagina>
  )
}

export default AgregarHorario
