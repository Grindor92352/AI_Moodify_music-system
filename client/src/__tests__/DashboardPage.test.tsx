import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import api from '../api/client'
import DashboardPage from '../pages/DashboardPage'
import { renderWithRouter } from '../test/testUtils'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

const mockedApi = vi.mocked(api)

describe('DashboardPage — mood selection and camera flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedApi.post.mockResolvedValue({
      data: {
        dominant_mood: 'Happy',
        mood: 'Happy',
        songs: [{ videoId: 'v1', title: 'Song 1', artist: 'A' }],
        videoIds: ['v1']
      }
    })
    mockedApi.get.mockResolvedValue({ data: { history: [] } })
  })

  it('renders quick mood chips and mood input', () => {
    renderWithRouter(<DashboardPage />)

    expect(screen.getByText('Happy')).toBeInTheDocument()
    expect(screen.getByText('Calm')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/I feel calm/i)).toBeInTheDocument()
    expect(screen.getByText('Visual mood scan')).toBeInTheDocument()
  })

  it('selects a quick mood and fills the text area', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DashboardPage />)

    await user.click(screen.getByRole('button', { name: 'Romantic' }))

    const textarea = screen.getByPlaceholderText(/I feel calm/i) as HTMLTextAreaElement
    expect(textarea.value).toBe('Romantic')
  })

  it('starts camera when Cam is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DashboardPage />)

    await user.click(screen.getByRole('button', { name: 'Cam' }))

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true })
    })
  })

  it('shows Snap label after camera is active', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DashboardPage />)

    await user.click(screen.getByRole('button', { name: 'Cam' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Snap' })).toBeInTheDocument()
    })
  })

  it('submits text mood and navigates to results', async () => {
    const user = userEvent.setup()
    renderWithRouter(<DashboardPage />)

    const textarea = screen.getByPlaceholderText(/I feel calm/i)
    await user.type(textarea, 'Focused study session')
    await user.click(screen.getByTitle('Search via Text'))

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/api/music/refresh', { mood: 'Focused study session' })
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/results',
        expect.objectContaining({
          state: expect.objectContaining({ mood: 'Focused study session' })
        })
      )
    })
  })
})
