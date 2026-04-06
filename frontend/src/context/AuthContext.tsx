import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  login as loginRequest,
  logout as logoutRequest,
  refreshAccessToken,
} from '../services/authService'
import { getAccessToken } from '../services/api'

type AuthUser = {
  email: string
}

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Access token is stored in memory (lost on page refresh)
  // User email is persisted in localStorage for recovery
  const [accessToken, setAccessTokenState] = useState<string | null>(
    getAccessToken(),
  )
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedEmail = localStorage.getItem('auth_user_email')
    if (!savedEmail) {
      return null
    }

    return { email: savedEmail }
  })

  const login = async (email: string, password: string) => {
    const result = await loginRequest(email, password)

    setAccessTokenState(result.access_token)
    setUser({ email })
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } catch {
      // Clear state even if logout request fails
    }

    setAccessTokenState(null)
    setUser(null)
  }

  useEffect(() => {
    const syncSession = () => {
      // Access token is in memory; user email may be in localStorage
      const storedEmail = localStorage.getItem('auth_user_email')

      setAccessTokenState(getAccessToken())
      setUser(storedEmail ? { email: storedEmail } : null)
    }

    const handleSessionChange = () => {
      syncSession()
    }

    window.addEventListener('auth:session-changed', handleSessionChange)
    window.addEventListener('storage', handleSessionChange)

    const bootstrapAuth = async () => {
      const storedEmail = localStorage.getItem('auth_user_email')

      console.log('[DIAG] Auth Init - access token:', localStorage.getItem('access_token'))
      console.log('[DIAG] Auth Init - refresh token:', localStorage.getItem('refresh_token'))
      console.log('[DIAG] Auth Init - stored email:', storedEmail)
      console.log('[DIAG] Auth Init - in-memory access token present:', Boolean(getAccessToken()))
      console.log('[DIAG] Auth Init - restoring auth state')

      if (!getAccessToken() && storedEmail) {
        try {
          console.log('[DIAG] Auth Init - attempting refresh access token')
          const refreshed = await refreshAccessToken()
          setAccessTokenState(refreshed.access_token)
          setUser({ email: storedEmail })
          console.log('[DIAG] Auth Init - authentication state restored successfully')
        } catch {
          console.log('[DIAG] Auth Init - refresh failed, clearing persisted auth state')
          localStorage.removeItem('auth_user_email')
          setAccessTokenState(null)
          setUser(null)
        }
      } else {
        console.log('[DIAG] Auth Init - no refresh needed during bootstrap')
      }

      setIsAuthLoading(false)
      console.log('[DIAG] Auth Init - completed, isAuthenticated:', Boolean(getAccessToken()))
    }

    void bootstrapAuth()

    return () => {
      window.removeEventListener('auth:session-changed', handleSessionChange)
      window.removeEventListener('storage', handleSessionChange)
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(accessToken),
      isAuthLoading,
      login,
      logout,
    }),
    [accessToken, isAuthLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }

  return context
}
