import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryProvider } from '@repo/shared-state/query'
import { initializeSharedState } from '@repo/shared-state/config'
import App from './App.tsx'
import './index.css'
import './styles/branding.css'
import { useAuthStore } from '@repo/shared-state/stores'

// Initialize shared state with environment variables
initializeSharedState({
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5050'
})

// Initialize platform and tenant domain at app startup
const authStore = useAuthStore.getState()
const tenantDomain = window.location.hostname
authStore.setPlatform('CUSTOMER_PORTAL')
authStore.setTenantDomain(tenantDomain)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>,
)