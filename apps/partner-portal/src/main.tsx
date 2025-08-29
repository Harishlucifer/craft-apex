import ReactDOM from 'react-dom/client'
import { QueryProvider } from '@repo/shared-state/query'
import { initializeSharedState } from '@repo/shared-state/config'
import { useAuthStore } from '@repo/shared-state/stores'
import App from './App.tsx'
import './index.css'

// Initialize shared state with environment variables
initializeSharedState({
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5050'
})

// Initialize platform and tenant domain at app startup
const authStore = useAuthStore.getState()
const tenantDomain = window.location.hostname
authStore.setPlatform('PARTNER_PORTAL')
authStore.setTenantDomain(tenantDomain)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <App />
  </QueryProvider>,
)