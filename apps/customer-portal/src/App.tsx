import LeadWorkflowPage from './components/LeadWorkflowPage';
import { Route,BrowserRouter as Router, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Expose QueryClient for TanStack Query DevTools
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__TANSTACK_QUERY_CLIENT__ = queryClient;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lead/create" element={<LeadWorkflowPage />} />
            <Route path="/lead/create/:id" element={<LeadWorkflowPage />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;