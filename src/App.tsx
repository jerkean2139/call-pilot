import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/layout/header';
import { AdminPortal } from './pages/AdminPortal';
import { AssessmentResults } from './pages/AssessmentResults';
import { AssessmentPage } from './pages/AssessmentPage';
import { GuidePage } from './pages/GuidePage';
import { ReportsPage } from './pages/ReportsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LeakageAssessment } from './pages/LeakageAssessment';
import { LeakageResults } from './pages/LeakageResults';

const queryClient = new QueryClient();

function HeaderLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Leakage routes — standalone full-screen layout, no header */}
          <Route path="/" element={<LeakageAssessment />} />
          <Route path="/leakage" element={<LeakageAssessment />} />
          <Route path="/leakage/results" element={<LeakageResults />} />

          {/* Other routes — with header */}
          <Route element={<HeaderLayout />}>
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/results" element={<AssessmentResults />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
