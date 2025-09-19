import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { Layout } from './components/layout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login page without header */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* All other pages with header */}
        <Route path="/" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
        <Route path="/lead/create" element={
          <Layout>
            <LeadDetailPage />
          </Layout>
        } />
        <Route path="/lead/create/:id" element={
          <Layout>
            <LeadDetailPage />
          </Layout>
        } />
        
        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App