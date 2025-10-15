import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "@repo/shared-state/components";
import { Toaster } from "@repo/ui/ui";
import { ModuleProvider } from "@repo/shared-state/contexts";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Redirect root paths to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard route - protected but no module access required */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireModuleAccess={false}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for any module URL pattern - must be last */}
        <Route
          path="*"
          element={
            <ModuleProvider>
              <ProtectedRoute requireModuleAccess={false}>
                <DashboardPage />
              </ProtectedRoute>
            </ModuleProvider>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App