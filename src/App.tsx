import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BabyProvider, useBabyContext } from './context/BabyContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import NewEntry from './pages/NewEntry';
import JournalEntry from './pages/JournalEntry';
import Milestones from './pages/Milestones';
import Growth from './pages/Growth';
import Gallery from './pages/Gallery';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import FamilyPortal from './pages/FamilyPortal';
import SharedView from './pages/SharedView';
import JoinFamily from './pages/JoinFamily';
import AdminDashboard from './pages/AdminDashboard';
import SkeletonList from './components/SkeletonCard';

function AppRoutes() {
  const { baby, loading: babyLoading } = useBabyContext();
  const { isAuthenticated, isSuperAdmin, loading: authLoading } = useAuth();

  if (authLoading || babyLoading) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900">
        <div className="mx-auto max-w-lg space-y-6 px-4 pt-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-rose-100" />
            <div className="space-y-2">
              <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
          <SkeletonList variant="stat" count={3} />
          <SkeletonList variant="card" count={2} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join/:code" element={<JoinFamily />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!baby) {
    return (
      <Routes>
        <Route path="/join/:code" element={<JoinFamily />} />
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/new" element={<NewEntry />} />
        <Route path="/journal/:id" element={<JournalEntry />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/family" element={<FamilyPortal />} />
        <Route path="/shared/:userId" element={<SharedView />} />
        {isSuperAdmin && (
          <Route path="/admin" element={<AdminDashboard />} />
        )}
      </Route>
      <Route path="/join/:code" element={<JoinFamily />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BabyProvider>
            <AppRoutes />
          </BabyProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
