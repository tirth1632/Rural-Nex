import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './i18n'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.tsx'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'

// Hide Capacitor splash screen once the app is mounted
if (Capacitor.isNativePlatform()) {
  SplashScreen.hide().catch(() => {});
}

const queryClient = new QueryClient()
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={clientId}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>

  </StrictMode>,
)

