import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PanelFormulario, Pagina } from '@/components/layout/Pagina'
import { Alert } from '@/components/ui'
import { IconCrear } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { FormularioTutoria } from '@/features/tutor/components/FormularioTutoria'
import { useCatalogosTutoria } from '@/features/tutor/hooks/useCatalogosTutoria'
import { useGuardarTutoria } from '@/features/tutor/hooks/useGuardarTutoria'

// Pantalla 10: crear una tutoria con su EE, su lugar y sus horarios semanales con temas.
const CrearTutoria = () => {
  const navigate = useNavigate()
  const { materias, edificios, cargando, error } = useCatalogosTutoria()
  const { guardar } = useGuardarTutoria()

  const crear = async (datos) => {
    const res = await guardar(datos)
    if (res.ok) {
      toast.success(res.message, { description: 'Ya es visible para los tutorados.' })
      const id = res.tutoria?.idTutoria
      navigate(id != null ? ROUTES.tutor.detalle(id) : ROUTES.tutor.inicio)
    }
    return res
  }

  return (
    <Pagina width="form">
      <PanelFormulario
        title="Crear tutoría"
        subtitle="Elige la Experiencia Educativa, el lugar y los horarios que se repetirán cada semana."
        icon={<IconCrear />}
      >
        {error ? <Alert tone="error">{error}</Alert> : null}
        <FormularioTutoria
          materias={materias}
          edificios={edificios}
          cargandoCatalogos={cargando}
          textoEnviar="Crear tutoría"
          onEnviar={crear}
        />
      </PanelFormulario>
    </Pagina>
  )
}

export default CrearTutoria
