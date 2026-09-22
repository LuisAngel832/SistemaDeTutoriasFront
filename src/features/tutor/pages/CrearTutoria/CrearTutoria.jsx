import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PanelFormulario, Pagina } from '@/components/layout/Pagina'
import { Alert, Button, FormField, Input, Select } from '@/components/ui'
import { IconCrear } from '@/components/ui/icons'
import { AULAS, EDIFICIOS } from '@/constants/espacios'
import { ROUTES } from '@/constants/routes'
import { TemasInput } from '@/features/tutorias/components/TemasInput'
import { useCrearTutoria } from '@/features/tutorias/hooks/useCrearTutoria'
import { crearTutoriaSchema } from '@/schemas/tutoria'
import { hoyLocalISO } from '@/utils/fechas'
import { formatHorario } from '@/utils/formatters'
import styles from './CrearTutoria.module.css'

const VALORES_INICIALES = { nrc: '', idHorario: '', fecha: '', edificio: '', aula: '', temas: [] }

// Agrega el tema si no esta repetido (sin distinguir mayusculas).
const agregarTema = (temas, tema) => {
  const limpio = tema.trim()
  if (!limpio || temas.some((t) => t.toLowerCase() === limpio.toLowerCase())) return temas
  return [...temas, limpio]
}

const CrearTutoria = () => {
  const { crear, horarios, materias, cargandoListas, isSubmitting } = useCrearTutoria()
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(crearTutoriaSchema), defaultValues: VALORES_INICIALES })

  const sinMaterias = !cargandoListas && materias.length === 0
  const sinHorarios = !cargandoListas && horarios.length === 0

  const enviar = handleSubmit(async (datos) => {
    const res = await crear(datos)
    if (!res.ok) {
      setError('root', { message: res.message })
      return
    }
    reset(VALORES_INICIALES)
    toast.success('Tutoría creada', {
      description: res.message,
      action: { label: 'Ver mis tutorías', onClick: () => navigate(ROUTES.tutor.inicio) },
    })
  })

  return (
    <Pagina width="form">
      <PanelFormulario
        title="Crear tutoría"
        subtitle="Programa una nueva sesión para tus tutorados."
        icon={<IconCrear />}
      >
        <form className={styles.formulario} onSubmit={enviar} noValidate>
          {errors.root ? (
            <Alert tone="error" className={styles.completo}>
              {errors.root.message}
            </Alert>
          ) : null}

          <FormField
            label="Experiencia Educativa que impartirás"
            htmlFor="nrc"
            error={errors.nrc?.message}
          >
            <Select id="nrc" disabled={sinMaterias} {...register('nrc')}>
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

          <FormField
            label="Horario en el que darás la tutoría"
            htmlFor="horario"
            error={errors.idHorario?.message}
          >
            <Select id="horario" disabled={sinHorarios} {...register('idHorario')}>
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
                  una tutoría.
                </span>
              </Alert>
            ) : null}
          </FormField>

          <FormField
            label="Fecha en que se dará la tutoría"
            htmlFor="fecha"
            error={errors.fecha?.message}
          >
            <Input id="fecha" type="date" min={hoyLocalISO()} {...register('fecha')} />
          </FormField>

          <FormField
            label="Edificio donde se dará la tutoría"
            htmlFor="edificio"
            error={errors.edificio?.message}
          >
            <Select id="edificio" {...register('edificio')}>
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
            htmlFor="aula"
            className={styles.completo}
            error={errors.aula?.message}
          >
            <Select id="aula" {...register('aula')}>
              <option value="">Selecciona el aula</option>
              {AULAS.map((numero) => (
                <option key={numero} value={numero}>
                  Aula {numero}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Temas a tratar durante la tutoría (opcional)"
            htmlFor="tema-nuevo"
            className={styles.completo}
            error={errors.temas?.message}
          >
            <Controller
              control={control}
              name="temas"
              render={({ field }) => (
                <TemasInput
                  inputId="tema-nuevo"
                  temas={field.value}
                  onAdd={(tema) => field.onChange(agregarTema(field.value, tema))}
                  onRemove={(tema) => field.onChange(field.value.filter((t) => t !== tema))}
                />
              )}
            />
          </FormField>

          <div className={styles.acciones}>
            <Button
              variant="secondary"
              onClick={() => reset(VALORES_INICIALES)}
              disabled={isSubmitting}
            >
              Limpiar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Crear tutoría'}
            </Button>
          </div>
        </form>
      </PanelFormulario>
    </Pagina>
  )
}

export default CrearTutoria
