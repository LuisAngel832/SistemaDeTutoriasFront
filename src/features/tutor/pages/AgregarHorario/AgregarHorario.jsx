import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { PanelFormulario, Pagina } from '@/components/layout/Pagina'
import { Button, FormField, Input, RadioGroup } from '@/components/ui'
import { IconHorario } from '@/components/ui/icons'
import { DIAS_SEMANA } from '@/constants/horarios'
import { useHorarios } from '@/features/horarios/hooks/useHorarios'
import { horarioSchema } from '@/schemas/horario'
import { avisar } from '@/utils/avisos'
import { ListaHorarios } from '@/features/horarios/components/ListaHorarios'
import styles from './AgregarHorario.module.css'

// El valor enviado al backend es `label` (sin acentos); se muestra `nombre`.
const OPCIONES_DIA = DIAS_SEMANA.map((dia) => ({
  value: dia.label,
  label: dia.nombre,
  shortLabel: dia.short,
}))

const VALORES_INICIALES = { dia: '', horaInicio: '', horaFin: '' }

// "HH:mm" del input -> "HH:mm:ss" que espera el backend.
const conSegundos = (hora) => `${hora}:00`

const AgregarHorario = () => {
  const { horarios, isLoading, error, crearHorario, creando, eliminarHorario, eliminandoId } =
    useHorarios()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(horarioSchema), defaultValues: VALORES_INICIALES })

  const enviar = handleSubmit(async (valores) => {
    try {
      await crearHorario({
        dia: valores.dia,
        horaInicio: conSegundos(valores.horaInicio),
        horaFin: conSegundos(valores.horaFin),
      })
      reset(VALORES_INICIALES)
      avisar({ ok: true, message: 'Horario creado correctamente.' })
    } catch (err) {
      avisar({ ok: false, message: err.message })
    }
  })

  const eliminar = async (idHorario) => {
    try {
      await eliminarHorario(idHorario)
      avisar({ ok: true, message: 'Horario eliminado.' })
    } catch (err) {
      avisar({ ok: false, message: err.message })
    }
  }

  return (
    <Pagina width="form">
      <PanelFormulario
        title="Crear horario"
        subtitle="Define los bloques recurrentes en los que puedes dar tutorías."
        icon={<IconHorario />}
      >
        <form className={styles.formulario} onSubmit={enviar} noValidate>
          <Controller
            control={control}
            name="dia"
            render={({ field }) => (
              <RadioGroup
                variant="chip"
                name={field.name}
                legend="Día de la semana en que estarás disponible"
                options={OPCIONES_DIA}
                value={field.value}
                onChange={field.onChange}
                error={errors.dia?.message}
              />
            )}
          />

          <div className={styles.horas}>
            <FormField
              label="Hora en que inicia tu disponibilidad"
              htmlFor="hora-inicio"
              error={errors.horaInicio?.message}
            >
              <Input id="hora-inicio" type="time" {...register('horaInicio')} />
            </FormField>
            <FormField
              label="Hora en que termina tu disponibilidad"
              htmlFor="hora-fin"
              error={errors.horaFin?.message}
            >
              <Input id="hora-fin" type="time" {...register('horaFin')} />
            </FormField>
          </div>

          <div className={styles.acciones}>
            <Button variant="secondary" onClick={() => reset(VALORES_INICIALES)} disabled={creando}>
              Limpiar
            </Button>
            <Button type="submit" loading={creando}>
              {creando ? 'Guardando…' : 'Crear horario'}
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
