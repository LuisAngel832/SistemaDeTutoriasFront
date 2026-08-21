import AppLayout from '../../../components/layout/AppLayout'
import AgregarHorarioForm from './AgregarHorarioForm'
import './agregarHorario.css'
import './agregarHorarioR.css'

const AgregarHorario = () => {
  return (
    <AppLayout className="agregar-horario-page">
      <AgregarHorarioForm />
    </AppLayout>
  )
}

export default AgregarHorario
