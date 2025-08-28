import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ModulePage } from "./pages/ModulePage";
import { TaskListPage } from "./pages/TaskListPage";
import { LeadListPage } from "./pages/LeadListPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "@repo/ui/ui";
import "./App.css";
import { ModuleProvider } from "./contexts/ModuleContext";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Specific module pages */}
        <Route 
          path="/ask/list" 
          element={
            <ProtectedRoute requireModuleAccess={true}>
              <TaskListPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/lead/list"
          element={
            // <ProtectedRoute requireModuleAccess={true}>
            <LeadListPage />
            // </ProtectedRoute>
          }
        />

        {/* Dashboard routes */}
        {/* <Route path="/" element={<Navigate to="/partner/dashboard" replace />} /> */}
        {/* <Route path="/dashboard" element={<Navigate to="/partner/dashboard" replace />} /> */}
        <Route path="/partner/dashboard" element={<DashboardPage />} />

        {/* Catch-all route for any module URL pattern - must be last */}
        <Route
          path="*"
          element={
            <ProtectedRoute requireModuleAccess={false}>
              <ModulePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
