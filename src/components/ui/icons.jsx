const baseProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconTutorias = () => (
  <svg {...baseProps}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" />
  </svg>
)

export const IconCrear = () => (
  <svg {...baseProps}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
)

export const IconHorario = () => (
  <svg {...baseProps}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    <path d="M12 12.5v3l2 1" />
  </svg>
)

export const IconExplorar = () => (
  <svg {...baseProps}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
)

export const IconMisTutorias = () => (
  <svg {...baseProps}>
    <path d="M6.5 3.5h11a1 1 0 0 1 1 1v15.2a.8.8 0 0 1-1.24.67L12 17l-5.26 3.37a.8.8 0 0 1-1.24-.67V4.5a1 1 0 0 1 1-1Z" />
    <path d="m9.5 9.5 1.8 1.8 3.2-3.3" />
  </svg>
)

export const IconLogout = () => (
  <svg {...baseProps}>
    <path d="M14.5 8V6a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-2" />
    <path d="M10 12h9.5m0 0-2.8-2.8M19.5 12l-2.8 2.8" />
  </svg>
)

export const IconCollapse = ({ collapsed }) => (
  <svg {...baseProps}>{collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}</svg>
)

export const IconClose = () => (
  <svg {...baseProps}>
    <path d="M7 7l10 10M17 7 7 17" />
  </svg>
)

// Iconos de informacion de una tutoria (reemplazan emojis, que se ven distinto en cada sistema).
export const IconCalendario = () => (
  <svg {...baseProps}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" />
  </svg>
)

export const IconReloj = () => (
  <svg {...baseProps}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const IconEdificio = () => (
  <svg {...baseProps}>
    <path d="M4 20.5h16M5.5 20.5V9.5L12 4l6.5 5.5v11" />
    <path d="M9 20.5v-5h6v5M9 11.5h.01M12 11.5h.01M15 11.5h.01" />
  </svg>
)

export const IconPuerta = () => (
  <svg {...baseProps}>
    <path d="M6 20.5V4.8a1 1 0 0 1 .8-1l9-1.6a1 1 0 0 1 1.2 1v17.3" />
    <path d="M4 20.5h16M13.5 12.5v.01" />
  </svg>
)

export const IconBuscar = IconExplorar

export const IconCorreo = () => (
  <svg {...baseProps}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

export const IconCampana = () => (
  <svg {...baseProps}>
    <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </svg>
)

export const IconAlerta = () => (
  <svg {...baseProps}>
    <path d="M10.3 4.3 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </svg>
)

export const IconCheck = () => (
  <svg {...baseProps}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const IconCruz = IconClose

export const IconMas = () => (
  <svg {...baseProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconUsuarios = () => (
  <svg {...baseProps}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0" />
    <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14a6.5 6.5 0 0 1 3 5.5" />
  </svg>
)

export const IconCuadricula = () => (
  <svg {...baseProps}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
)

export const IconHistorial = () => (
  <svg {...baseProps}>
    <path d="M10 6.5h10M10 12h10M10 17.5h10" />
    <path d="m3.5 6.5 1.2 1.2L7 5.4M3.5 12l1.2 1.2L7 10.9M3.5 17.5l1.2 1.2L7 16.4" />
  </svg>
)

export const IconFlechaIzquierda = () => (
  <svg {...baseProps}>
    <path d="M19 12H5m0 0 5.5-5.5M5 12l5.5 5.5" />
  </svg>
)

export const IconFlechaDerecha = () => (
  <svg {...baseProps}>
    <path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5" />
  </svg>
)
