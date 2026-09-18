import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Button, FormField, Input, Select } from '../../../components/ui'
import { AULAS, EDIFICIOS } from '../../../constants/espacios'
import { editarTutoriaSchema } from '../../../schemas/tutoria'
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
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editarTutoriaSchema),
    defaultValues: valoresIniciales(tutoria, horarios),
  })

  const enviar = handleSubmit(async (datos) => {
    const res = await onGuardar(datos)
    if (!res.ok) setError('root', { message: res.message })
  })

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <h2 className={styles.titulo}>Editar tutoría</h2>

      {errors.root ? <Alert tone="error">{errors.root.message}</Alert> : null}

      <div className={styles.grid}>
        <FormField
          label="Horario en el que darás la tutoría"
          htmlFor="editar-horario"
          error={errors.idHorario?.message}
        >
          <Select id="editar-horario" {...register('idHorario')}>
            <option value="">Selecciona un horario</option>
            {horarios.map((horario) => (
              <option key={horario.idHorario} value={horario.idHorario}>
                {formatHorario(horario)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Fecha en que se dará la tutoría"
          htmlFor="editar-fecha"
          error={errors.fecha?.message}
        >
          <Input id="editar-fecha" type="date" min={hoyLocalISO()} {...register('fecha')} />
        </FormField>

        <FormField
          label="Edificio donde se dará la tutoría"
          htmlFor="editar-edificio"
          error={errors.edificio?.message}
        >
          <Select id="editar-edificio" {...register('edificio')}>
            <option value="">Selecciona el edificio</option>
            {EDIFICIOS.map((numero) => (
              <option key={numero} value={numero}>
                Edificio {numero}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Aula donde se dará la tutoría"
          htmlFor="editar-aula"
          error={errors.aula?.message}
        >
          <Select id="editar-aula" {...register('aula')}>
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
