import { z } from 'zod'

// Las horas llegan como "HH:mm" del input; comparar strings alcanza para validar el orden.
export const horarioSchema = z
  .object({
    dia: z.string().min(1, 'Elige el día de la semana'),
    horaInicio: z.string().min(1, 'Indica la hora de inicio'),
    horaFin: z.string().min(1, 'Indica la hora de término'),
  })
  .refine((valores) => valores.horaFin > valores.horaInicio, {
    message: 'La hora final debe ser mayor que la hora de inicio',
    path: ['horaFin'],
  })
