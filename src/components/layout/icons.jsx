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
  <svg {...baseProps}>
    {collapsed ? (
      <path d="m9 6 6 6-6 6" />
    ) : (
      <path d="m15 6-6 6 6 6" />
    )}
  </svg>
)

export const IconClose = () => (
  <svg {...baseProps}>
    <path d="M7 7l10 10M17 7 7 17" />
  </svg>
)
