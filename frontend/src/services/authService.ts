import api, { setAccessToken } from './api'

export type LoginResponse = {
  access_token: string
  refresh_token: string
  token_type: string
}

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  name: string
  email: string
  password: string
}

type RegisterResponse = {
  message: string
  user_id: string
}

type RefreshResponse = LoginResponse

type LogoutResponse = {
  message: string
}

function emitSessionChange() {
  window.dispatchEvent(new Event('auth:session-changed'))
}

function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

function clearPersistedTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const payload: LoginPayload = { email, password }
  const response = await api.post<LoginResponse>('/auth/login', payload)

  // Store access token in memory
  setAccessToken(response.data.access_token)

  // Persist tokens for refresh fallback and auth recovery.
  persistTokens(response.data.access_token, response.data.refresh_token)

  // Store email for persistence.
  localStorage.setItem('auth_user_email', email)
  emitSessionChange()
  return response.data
}

export async function register(name: string, email: string, password: string): Promise<RegisterResponse> {
  const payload: RegisterPayload = { name, email, password }
  const response = await api.post<RegisterResponse>('/auth/register', payload)
  return response.data
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
  const refreshToken = localStorage.getItem('refresh_token')

  // Send refresh token in body to support deployments where cross-site cookies are blocked.
  const response = await api.post<RefreshResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  })

  // Store new access token in memory
  setAccessToken(response.data.access_token)

  // Refresh may rotate both tokens.
  persistTokens(response.data.access_token, response.data.refresh_token)
  emitSessionChange()

  return response.data
}

export async function logout(): Promise<LogoutResponse> {
  const refreshToken = localStorage.getItem('refresh_token')

  try {
    const response = await api.post<LogoutResponse>('/auth/logout', {
      refresh_token: refreshToken,
    })

    // Clear local state
    setAccessToken(null)
    clearPersistedTokens()
    localStorage.removeItem('auth_user_email')
    emitSessionChange()

    return response.data
  } catch (error) {
    // Clear local state even if request fails
    setAccessToken(null)
    clearPersistedTokens()
    localStorage.removeItem('auth_user_email')
    emitSessionChange()
    throw error
  }
}
