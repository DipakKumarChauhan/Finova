import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { OrganizationProvider } from './context/OrganizationContext'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: '14px',
            background: '#0f172a',
            color: '#fff',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.18)',
          },
          success: {
            style: {
              background: '#0f766e',
            },
          },
          error: {
            style: {
              background: '#be123c',
            },
          },
        }}
      />
      <AuthProvider>
        <OrganizationProvider>
          <App />
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
