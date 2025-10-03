import ReactDOM from 'react-dom/client'
import { QueryProvider } from '@repo/shared-state/query'
import { initializeSharedState } from '@repo/shared-state/config'
import { useAuthStore } from '@repo/shared-state/stores'
import { PlatformType } from '@repo/types/setup'
import App from './App.tsx'
import './index.css'

// Initialize shared state with environment variables
initializeSharedState({
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5050'
})

// Initialize authentication setup for customer portal
const initializeAuth = async () => {
  try {
    const platform: PlatformType = 'CUSTOMER_PORTAL'
    const tenantDomain = window.location.hostname || 'localhost'
    
    console.log(`🔄 Initializing customer portal authentication...`)
    console.log(`Platform: ${platform}, Domain: ${tenantDomain}`)
    console.log(`API Endpoint: ${import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5050'}`)
    
    // Get the fetchSetup function from the auth store
    const { fetchSetup } = useAuthStore.getState()
    
    // Call fetchSetup with customer portal platform and current domain
    await fetchSetup(platform, tenantDomain)
    
    console.log('✅ Customer portal authentication setup completed successfully')
  } catch (error) {
    console.warn('⚠️ Authentication setup failed, but app will continue to work:', error)
    
    // Log additional details for debugging
    if (error instanceof Error) {
      console.warn('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
    }
    
    // Check if it's a network error
    if (error instanceof Error && error.message.includes('fetch')) {
      console.warn('💡 This might be a network connectivity issue. Please ensure the backend API is running.')
    }
    
    // Don't throw the error to prevent app from crashing
    // The app should still render even if setup fails
  }
}

// Initialize authentication asynchronously after app starts
// This ensures the app renders immediately while setup happens in the background
initializeAuth().catch((error) => {
  console.error('❌ Authentication initialization failed:', error)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <App />
  </QueryProvider>,
)
