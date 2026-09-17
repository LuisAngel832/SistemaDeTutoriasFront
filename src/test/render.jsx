import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Renderiza un componente dentro de un router en memoria (para Link, useNavigate, etc.).
export const renderConRouter = (ui, { ruta = '/' } = {}) =>
  render(<MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>)
