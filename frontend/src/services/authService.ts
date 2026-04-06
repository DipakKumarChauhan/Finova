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

export async function login(email: string, password: string): Promise<LoginResponse> {
  const payload: LoginPayload = { email, password }
  const response = await api.post<LoginResponse>('/auth/login', payload)
  
  // Store access token in memory
  setAccessToken(response.data.access_token)
  
  // Store email for persistence (refresh token goes to HttpOnly cookie automatically)
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
  // Refresh token is in HttpOnly cookie, automatically sent with request
  const response = await api.post<RefreshResponse>('/auth/refresh', {})

  // Store new access token in memory
  setAccessToken(response.data.access_token)
  emitSessionChange()

  return response.data
}

export async function logout(): Promise<LogoutResponse> {
  // Get current access token from memory to send with request
  try {
    // Send request with current token; refresh token cookie is sent automatically
    const response = await api.post<LogoutResponse>('/auth/logout', {})

    // Clear local state
    setAccessToken(null)
    localStorage.removeItem('auth_user_email')
    emitSessionChange()

    return response.data
  } catch (error) {
    // Clear local state even if request fails
    setAccessToken(null)
    localStorage.removeItem('auth_user_email')
    emitSessionChange()
    throw error
  }
}
