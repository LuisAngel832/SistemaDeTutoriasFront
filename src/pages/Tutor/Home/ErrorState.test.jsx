import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ErrorState from './ErrorState'

describe('ErrorState', () => {
  it('shows the message and triggers retry', async () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Algo falló" onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló')

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
