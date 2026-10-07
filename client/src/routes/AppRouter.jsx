import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppShell from '../components/layout/AppShell.jsx';

import LoginPage          from '../pages/auth/LoginPage.jsx';
import RegisterPage       from '../pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage.jsx';
import DashboardPage      from '../pages/DashboardPage.jsx';
import TasksPage          from '../pages/TasksPage.jsx';
import JobsPage           from '../pages/JobsPage.jsx';
import EventsPage         from '../pages/EventsPage.jsx';
import CalendarPage       from '../pages/CalendarPage.jsx';
import ProfilePage        from '../pages/ProfilePage.jsx';
import NotFoundPage       from '../pages/NotFoundPage.jsx';

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"          element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register"       element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected app routes inside AppShell */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/"         element={<DashboardPage />} />
        <Route path="/tasks"    element={<TasksPage />} />
        <Route path="/jobs"     element={<JobsPage />} />
        <Route path="/events"   element={<EventsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile"  element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
