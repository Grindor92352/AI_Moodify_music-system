import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

const mockAuthValue = {
  user: { email: 'test@example.com', name: 'Test User', preferredSingers: [] },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn()
}

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuthValue
}))

vi.mock('../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

export function renderWithRouter(ui: React.ReactElement, initialEntries = ['/dashboard']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  )
}
