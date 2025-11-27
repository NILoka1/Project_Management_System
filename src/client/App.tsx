import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProjectList } from "./pages/ProjectPage";
import { HomePage } from "./pages/HomePage";
import { TasksPage } from "./pages/Tasks/TasksPage";
import { TeamList } from "./pages/teamsPage";
import { Users } from "./pages/UsersPage";
import { FullProject } from "./pages/FullProject";
import { FullOneTeam } from "./pages/FullTeam";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Публичные routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Защищенные routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:projectId"
            element={
              <ProtectedRoute>
                <FullProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/:teamId"
            element={
              <ProtectedRoute>
                <FullOneTeam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
