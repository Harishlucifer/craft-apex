import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage";
import {DashboardPage} from "./pages/DashboardPage";
import {ModulePage} from "./pages/ModulePage";
import {TaskListPage} from "./pages/TaskListPage";
import {LeadListPage} from "./pages/LeadListPage";
import {LeadDetailPage} from "./pages/LeadDetailPage";
import {ProtectedRoute} from "@repo/shared-state/components";
import {Toaster} from "@repo/ui/ui";
import "./App.css";
import {ModuleProvider} from "@repo/shared-state/contexts";
import {PartnerDetailPage} from "@/pages/PartnerDetailPage.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                {/*Partner registration*/}
                <Route path="/partner/create" element={<PartnerDetailPage/>}/>
                 <Route path="/partner/create/:id" element={<PartnerDetailPage/>}/>
                {/* Redirect root paths to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route path="/dashboard" element={<DashboardPage/>}/>

                {/* Dashboard route - protected but no module access required */}
                <Route
                    path="/partner/dashboard"
                    element={
                        <ProtectedRoute requireModuleAccess={false}>
                            <DashboardPage/>
                        </ProtectedRoute>
                    }
                />

                {/* Specific module pages - all require module access */}
                <Route
                    path="/ask/list"
                    element={
                        <ModuleProvider>
                            <ProtectedRoute requireModuleAccess={true}>
                                <TaskListPage/>
                            </ProtectedRoute>
                        </ModuleProvider>
                    }
                />
                <Route
                    path="/lead/list"
                    element={
                        <ModuleProvider>
                            <ProtectedRoute requireModuleAccess={true}>
                                <LeadListPage/>
                            </ProtectedRoute>
                        </ModuleProvider>
                    }
                />
                <Route
                    path="/lead/create"
                    element={
                        <ModuleProvider>
                            <ProtectedRoute requireModuleAccess={true}>
                                <LeadDetailPage/>
                            </ProtectedRoute>
                        </ModuleProvider>
                    }
                />
                <Route
                    path="/lead/create/:id"
                    element={
                        <ModuleProvider>
                            <ProtectedRoute requireModuleAccess={true}>
                                <LeadDetailPage/>
                            </ProtectedRoute>
                        </ModuleProvider>
                    }
                />
                <Route
                    path="/employeeConnector/list"
                    element={
                        <ModuleProvider>
                            <ProtectedRoute requireModuleAccess={true}>
                                <ModulePage/>
                            </ProtectedRoute>
                        </ModuleProvider>
                    }
                />

                {/* Catch-all route for any module URL pattern - must be last */}
                <Route
                    path="*"
                    element={
                        <ModuleProvider>
                            <ProtectedRoute requireModuleAccess={false}>
                                <ModulePage/>
                            </ProtectedRoute>
                        </ModuleProvider>
                    }
                />
            </Routes>
            <Toaster/>
        </Router>
    );
}

export default App;
