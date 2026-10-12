import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Alert, Button, FormField, Input, RadioGroup, Select } from '@/components/ui'
import { IconClose, IconUsuarios } from '@/components/ui/icons'
import { buscarDia, DIAS_HABILES } from '@/constants/horarios'
import { CUPO_MAXIMO } from '@/constants/tutoria'
import { TemasInput } from '@/features/tutorias/components/TemasInput'
import { formularioTutoriaSchema } from '@/schemas/tutoria'
import styles from './FormularioTutoria.module.css'

const OPCIONES_DIA = DIAS_HABILES.map((dia) => ({
  value: dia.key,
  label: dia.nombre,
  shortLabel: dia.corto,
}))

const HORARIO_VACIO = { idHorario: null, dia: '', horaInicio: '', horaFin: '', temas: [] }

const VALORES_VACIOS = { idMateria: '', edificio: '', aula: '', horarios: [HORARIO_VACIO] }

// Formulario de la pantalla 10, para crear o editar una tutoria. En la edicion la EE no cambia
// (RN-5): se muestra bloqueada. `onEnviar` recibe los datos validados y devuelve
// { ok, message }; si falla, el mensaje se muestra arriba del formulario.
export const FormularioTutoria = ({
  editar = false,
  valoresIniciales = VALORES_VACIOS,
  materias,
  edificios,
  cargandoCatalogos,
  textoEnviar,
  onEnviar,
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formularioTutoriaSchema),
    defaultValues: valoresIniciales,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'horarios' })
  const edificio = useWatch({ control, name: 'edificio' })
  const horarios = useWatch({ control, name: 'horarios' })
  const aulas = edificios.find((item) => String(item.edificio) === String(edificio))?.aulas ?? []

  const enviar = handleSubmit(async (datos) => {
    const res = await onEnviar(datos)
    if (!res.ok) setError('root', { message: res.message })
  })

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      {errors.root ? (
        <Alert tone="error" className={styles.completo}>
          {errors.root.message}
        </Alert>
      ) : null}

      <FormField
        label="Experiencia Educativa que impartirás"
        htmlFor="idMateria"
        className={styles.completo}
        hint={editar ? 'La Experiencia Educativa no se puede cambiar.' : undefined}
        error={errors.idMateria?.message}
      >
        <Select id="idMateria" disabled={editar || cargandoCatalogos} {...register('idMateria')}>
          <option value="">
            {cargandoCatalogos ? 'Cargando…' : 'Elige la Experiencia Educativa'}
          </option>
          {materias.map((materia) => (
            <option key={materia.idMateria} value={String(materia.idMateria)}>
              {materia.nombre} (NRC {materia.nrc})
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Edificio" htmlFor="edificio" error={errors.edificio?.message}>
        <Select
          id="edificio"
          disabled={cargandoCatalogos}
          {...register('edificio', { onChange: () => setValue('aula', '') })}
        >
          <option value="">Elige el edificio</option>
          {edificios.map((item) => (
            <option key={item.edificio} value={String(item.edificio)}>
              Edificio {item.edificio}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Aula" htmlFor="aula" error={errors.aula?.message}>
        <Select id="aula" disabled={!edificio || cargandoCatalogos} {...register('aula')}>
          <option value="">{edificio ? 'Elige el aula' : 'Elige primero el edificio'}</option>
          {aulas.map((aula) => (
            <option key={aula} value={String(aula)}>
              Aula {aula}
            </option>
          ))}
        </Select>
      </FormField>

      <p className={styles.cupo}>
        <IconUsuarios />
        <span>
          <strong>Cupo de {CUPO_MAXIMO} tutorados.</strong> Quien se inscriba queda en todos los
          horarios de la tutoría.
        </span>
      </p>

      <div className={styles.horariosEncabezado}>
        <h2>Horarios semanales</h2>
        <p>
          Cada horario se repite cada semana, genera su propia sesión con pase de lista y tiene sus
          temas.
        </p>
        {errors.horarios?.root?.message || errors.horarios?.message ? (
          <p className={styles.error} role="alert">
            {errors.horarios?.root?.message ?? errors.horarios?.message}
          </p>
        ) : null}
      </div>

      {fields.map((field, indice) => {
        const errorHorario = errors.horarios?.[indice] ?? {}
        const dia = buscarDia(horarios?.[indice]?.dia)
        const prefijo = `horario-${indice}`

        return (
          <fieldset key={field.id} className={styles.horario}>
            <legend className={styles.horarioTitulo}>Horario {indice + 1}</legend>
            {fields.length > 1 ? (
              <button
                type="button"
                className={styles.quitar}
                onClick={() => remove(indice)}
                aria-label={`Quitar el horario ${indice + 1}`}
              >
                <IconClose />
              </button>
            ) : null}

            <Controller
              control={control}
              name={`horarios.${indice}.dia`}
              render={({ field: campo }) => (
                <RadioGroup
                  className={styles.dias}
                  name={`${prefijo}-dia`}
                  legend="Día"
                  variant="chip"
                  options={OPCIONES_DIA}
                  value={campo.value}
                  onChange={campo.onChange}
                  error={errorHorario.dia?.message}
                />
              )}
            />

            <div className={styles.horas}>
              <FormField
                label="Hora de inicio"
                htmlFor={`${prefijo}-inicio`}
                error={errorHorario.horaInicio?.message}
              >
                <Input
                  id={`${prefijo}-inicio`}
                  type="time"
                  step={300}
                  {...register(`horarios.${indice}.horaInicio`)}
                />
              </FormField>
              <FormField
                label="Hora de fin"
                htmlFor={`${prefijo}-fin`}
                error={errorHorario.horaFin?.message}
              >
                <Input
                  id={`${prefijo}-fin`}
                  type="time"
                  step={300}
                  {...register(`horarios.${indice}.horaFin`)}
                />
              </FormField>
            </div>

            <Controller
              control={control}
              name={`horarios.${indice}.temas`}
              render={({ field: campo }) => (
                <div className={styles.temas}>
                  <span className={styles.etiqueta} id={`${prefijo}-temas`}>
                    Temas de este horario
                  </span>
                  <TemasInput
                    temas={campo.value ?? []}
                    label={`Tema nuevo para el horario ${indice + 1}`}
                    hint={`Los tutorados verán estos temas en las sesiones ${
                      dia ? `del ${dia.nombre.toLowerCase()}` : 'de este horario'
                    }.`}
                    onAdd={(tema) => {
                      const actuales = campo.value ?? []
                      const repetido = actuales.some((t) => t.toLowerCase() === tema.toLowerCase())
                      if (!repetido) campo.onChange([...actuales, tema])
                    }}
                    onRemove={(tema) =>
                      campo.onChange((campo.value ?? []).filter((t) => t !== tema))
                    }
                  />
                  {errorHorario.temas?.message ? (
                    <p className={styles.error}>{errorHorario.temas.message}</p>
                  ) : null}
                </div>
              )}
            />
          </fieldset>
        )
      })}

      <button type="button" className={styles.agregar} onClick={() => append(HORARIO_VACIO)}>
        + Agregar otro horario
      </button>

      <div className={styles.acciones}>
        <Button variant="secondary" onClick={() => reset(valoresIniciales)} disabled={isSubmitting}>
          {editar ? 'Deshacer cambios' : 'Limpiar'}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? 'Guardando…' : textoEnviar}
        </Button>
      </div>
    </form>
  )
}
