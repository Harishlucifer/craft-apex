import ReactDOM from 'react-dom/client'
import { QueryProvider } from '@repo/shared-state/query'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <App />
  </QueryProvider>,
)