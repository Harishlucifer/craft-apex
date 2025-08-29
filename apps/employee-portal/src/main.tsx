import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryProvider } from '@repo/shared-state/query'
import { initializeSharedState } from '@repo/shared-state/config'
import App from './App.tsx'
import './index.css'

// Initialize shared state with environment variables
initializeSharedState({
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5050'
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>,
)