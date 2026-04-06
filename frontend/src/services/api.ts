import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `${window.location.protocol}//${window.location.hostname}:8000`

type RetryableConfig = {
  _retry?: boolean
}

// Store access token in memory only (lost on refresh, more secure from XSS)
let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

function emitSessionChange() {
  window.dispatchEvent(new Event('auth:session-changed'))
}

function clearStoredSession() {
  accessToken = null
  localStorage.removeItem('auth_user_email')
  emitSessionChange()
}

  export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

async function refreshSession() {
  // Refresh token is in HttpOnly cookie, automatically sent with requests
  // Use the shared client so cookies/credentials are included
  const response = await api.post('/auth/refresh', {})

  accessToken = response.data.access_token
  emitSessionChange()

  return response.data.access_token as string
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Include cookies in requests
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config as (typeof error.config & RetryableConfig) | undefined
    const requestUrl: string = originalRequest?.url ?? ''

    if (status === 401) {
      console.debug('[auth] 401 response received for', requestUrl)
    }

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout')
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      console.debug('[auth] attempting refresh token flow')
      refreshPromise ??= refreshSession()
      const refreshedToken = await refreshPromise
      refreshPromise = null

      if (!refreshedToken) {
        console.warn('[auth] refresh token flow returned no access token')
        clearStoredSession()
        return Promise.reject(error)
      }

      console.debug('[auth] refresh succeeded, retrying original request')
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`

      return api(originalRequest)
    } catch (refreshError) {
      console.warn('[auth] refresh token flow failed, clearing session')
      refreshPromise = null
      clearStoredSession()
      return Promise.reject(refreshError)
    }
  },
)

export default api
