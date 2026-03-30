import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectList } from './pages/projectList/ProjectPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/Tasks/TasksPage';
import { TeamList } from './pages/teamList/teamsPage';
import { Users } from './pages/UsersPage/UsersPage';
import { FullProject } from './pages/FullProject/FullProject';
import { FullOneTeam } from './pages/FullTeam/FullTeam';
import { JSX } from 'react';

export default function App(): JSX.Element {
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
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <TeamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/:teamId"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <FullOneTeam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
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
