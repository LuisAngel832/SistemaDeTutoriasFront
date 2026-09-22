import { clases } from '@/utils/clases'
import styles from './Button.module.css'
import { Spinner } from './Spinner'

const SPINNER_INVERSO = new Set(['primary', 'brand', 'danger'])

// variant: primary | brand | secondary | danger | danger-outline
// size: sm | md | lg
// `as` permite renderizar otro elemento con el mismo estilo (p. ej. as={Link} to="...").
export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  as: Componente = 'button',
  type,
  disabled,
  className,
  children,
  ...props
}) => {
  const esBoton = Componente === 'button'

  return (
    <Componente
      className={clases(
        styles.boton,
        styles[variant],
        styles[size],
        fullWidth && styles.completo,
        className,
      )}
      {...(esBoton ? { type: type ?? 'button', disabled: disabled || loading } : {})}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" tone={SPINNER_INVERSO.has(variant) ? 'inverse' : 'primary'} />
      ) : null}
      {children}
    </Componente>
  )
}
