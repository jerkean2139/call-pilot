import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BabyProvider, useBabyContext } from './context/BabyContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import NewEntry from './pages/NewEntry';
import JournalEntry from './pages/JournalEntry';
import Milestones from './pages/Milestones';
import Growth from './pages/Growth';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';

function AppRoutes() {
  const { baby, loading } = useBabyContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-full bg-rose-200" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!baby) {
    return (
      <Routes>
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
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BabyProvider>
        <AppRoutes />
      </BabyProvider>
    </BrowserRouter>
  );
}
