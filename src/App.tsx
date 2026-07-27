import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationToasts } from "./components/NotificationToasts";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminAlerts } from "./pages/admin/AdminAlerts";
import { AdminInsights } from "./pages/admin/AdminInsights";
import { SupervisorDashboard } from "./pages/supervisor/SupervisorDashboard";
import { SupervisorViolations } from "./pages/supervisor/SupervisorViolations";
import { SupervisorReports } from "./pages/supervisor/SupervisorReports";

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/supervisor"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <NotificationToasts />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute allow={["admin"]} />}>
              <Route element={<AppShell />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/alerts" element={<AdminAlerts />} />
                <Route path="/admin/insights" element={<AdminInsights />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allow={["supervisor"]} />}>
              <Route element={<AppShell />}>
                <Route path="/supervisor" element={<SupervisorDashboard />} />
                <Route path="/supervisor/violations" element={<SupervisorViolations />} />
                <Route path="/supervisor/reports" element={<SupervisorReports />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
