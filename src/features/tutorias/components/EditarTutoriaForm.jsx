import { useState } from 'react'
import { Alert, Button, FormField, Input, Select } from '../../../components/ui'
import { AULAS, EDIFICIOS } from '../../../constants/espacios'
import { hoyLocalISO } from '../../../utils/fechas'
import { formatHorario } from '../../../utils/formatters'
import { buscarHorarioDeTutoria } from '../../../utils/tutoria'
import styles from './EditarTutoriaForm.module.css'

const valoresIniciales = (tutoria, horarios) => {
  const horario = buscarHorarioDeTutoria(horarios, tutoria)
  return {
    idHorario: horario ? String(horario.idHorario) : '',
    fecha: tutoria.fecha ?? '',
    edificio: tutoria.edificio != null ? String(tutoria.edificio) : '',
    aula: tutoria.aula != null ? String(tutoria.aula) : '',
  }
}

// Edicion de horario, fecha y lugar de una tutoria programada.
// onGuardar(payload) devuelve { ok, message }; si falla, el error se muestra en el formulario.
export const EditarTutoriaForm = ({ tutoria, horarios, isSubmitting, onGuardar, onCancelar }) => {
  const [valores, setValores] = useState(() => valoresIniciales(tutoria, horarios))
  const [error, setError] = useState('')

  const cambiar = (campo) => (evento) => {
    setValores((actuales) => ({ ...actuales, [campo]: evento.target.value }))
    setError('')
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    // Se valida antes de convertir: Number('') es 0 y pasaria como numero valido.
    if (!valores.idHorario || !valores.fecha || !valores.edificio || !valores.aula) {
      setError('Completa todos los campos.')
      return
    }

    const res = await onGuardar({
      idHorario: Number(valores.idHorario),
      fecha: valores.fecha,
      edificio: Number(valores.edificio),
      aula: Number(valores.aula),
    })
    if (!res.ok) setError(res.message)
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <h2 className={styles.titulo}>Editar tutoría</h2>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className={styles.grid}>
        <FormField label="Horario en el que darás la tutoría" htmlFor="editar-horario">
          <Select id="editar-horario" value={valores.idHorario} onChange={cambiar('idHorario')}>
            <option value="">Selecciona un horario</option>
            {horarios.map((horario) => (
              <option key={horario.idHorario} value={horario.idHorario}>
                {formatHorario(horario)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Fecha en que se dará la tutoría" htmlFor="editar-fecha">
          <Input
            id="editar-fecha"
            type="date"
            min={hoyLocalISO()}
            value={valores.fecha}
            onChange={cambiar('fecha')}
          />
        </FormField>

        <FormField label="Edificio donde se dará la tutoría" htmlFor="editar-edificio">
          <Select id="editar-edificio" value={valores.edificio} onChange={cambiar('edificio')}>
            <option value="">Selecciona el edificio</option>
            {EDIFICIOS.map((numero) => (
              <option key={numero} value={numero}>
                Edificio {numero}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Aula donde se dará la tutoría" htmlFor="editar-aula">
          <Select id="editar-aula" value={valores.aula} onChange={cambiar('aula')}>
            <option value="">Selecciona el aula</option>
            {AULAS.map((numero) => (
              <option key={numero} value={numero}>
                Aula {numero}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className={styles.acciones}>
        <Button variant="secondary" onClick={onCancelar} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
